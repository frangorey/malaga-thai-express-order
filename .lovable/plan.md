# Fase 3 — Refactor bloque Sopas en Index.tsx (BD-driven)

Eliminar IDs hardcoded `[127..132]` del bloque Sopas y centralizar media (`video_url`, `image_url`) en `dish_templates`, resolviendo variantes por `template_id` en lugar de por id numérico.

## Archivos

1. **NUEVO** `src/hooks/useDishTemplates.ts` (plural)
2. **MODIFICADO** `src/pages/Index.tsx`

No se toca: BD, RLS, edge functions, `useDishTemplate.ts` singular, `types.ts`, NOODLE_CARDS, RICE_CARDS, VARIANT_GROUPS (Entrantes), `SoupCustomizer.tsx`, ni i18n (las claves `soup_chicken_label/soup_prawn_label/soup_veggie_label` ya existen en es/en/fr/de/ru).

## 1) `src/hooks/useDishTemplates.ts`

Hook eager que cachea todos los templates activos (1h stale, 2h gc) y reutiliza el tipo `DishTemplate` exportado por `useDishTemplate.ts`:

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DishTemplate } from "@/hooks/useDishTemplate";

export function useDishTemplates() {
  return useQuery({
    queryKey: ["dish_templates", "all"],
    queryFn: async (): Promise<DishTemplate[]> => {
      const { data, error } = await supabase
        .from("dish_templates")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return (data ?? []) as DishTemplate[];
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
  });
}
```

## 2) `src/pages/Index.tsx`

**Imports** (junto a los existentes):
```ts
import { useDishTemplates } from "@/hooks/useDishTemplates";
import type { DishTemplate } from "@/hooks/useDishTemplate";
```

**Dentro del componente**, tras `const { products, loading } = useProducts();`:
```ts
const { data: dishTemplates } = useDishTemplates();
const templatesBySlug = useMemo(() => {
  const map = new Map<string, DishTemplate>();
  (dishTemplates ?? []).forEach((tpl) => map.set(tpl.slug, tpl));
  return map;
}, [dishTemplates]);
```

**Eliminar** la constante `SOUP_GROUPS` (líneas ~80-83) y reemplazar por:
```ts
const SOUP_CARDS: { slug: string; displayNameKey: string; emoji: string }[] = [
  { slug: "sopa_tom_yam", displayNameKey: "soup_tom_yam", emoji: "🍲" },
  { slug: "sopa_miso",    displayNameKey: "soup_miso",    emoji: "🍜" },
];
```

**Reescribir** el bloque `if (dbCategory === "Sopas")` dentro del `useMemo videoItems`:
```ts
if (dbCategory === "Sopas") {
  const items: FeaturedItem[] = [];
  for (const sc of SOUP_CARDS) {
    const template = templatesBySlug.get(sc.slug);
    if (!template) continue;
    const groupProducts = categoryProducts.filter((p) => p.template_id === template.id);
    if (groupProducts.length === 0) continue;
    const primary = groupProducts[0];
    items.push({
      product: toSupabaseProduct(primary),
      videoUrl: template.video_url ?? primary.video_url ?? null,
      posterUrl: template.image_url || primary.image_url || PLACEHOLDER_POSTER,
      imageUrl: template.image_url ?? primary.image_url,
      tags: [],
      displayName: `${sc.emoji} ${t(sc.displayNameKey)}`,
      variants: groupProducts.map((p) => {
        let proteinKey = "";
        if (p.is_vegetarian === true) proteinKey = "soup_veggie_label";
        else if (p.name.toLowerCase().includes("langostino")) proteinKey = "soup_prawn_label";
        else if (p.name.toLowerCase().includes("pollo")) proteinKey = "soup_chicken_label";
        return {
          product: toSupabaseProduct(p),
          label: `${t(proteinKey)} — ${p.price.toFixed(2)}€`,
        };
      }),
    });
  }
  return items;
}
```
Orden de detección: **veggie → langostino → pollo** (langostino antes que pollo blinda contra futuros nombres tipo "pollo y langostino").

**Actualizar** el dependency array del `useMemo videoItems` añadiendo `templatesBySlug`:
```ts
}, [products, activeCategory, t, templatesBySlug]);
```

## Optimización propuesta sobre el prompt original

El prompt está bien dimensionado y los tipos ya existen. Una única mejora menor opcional: el campo `proteinKey` puede quedar `""` si un producto no matchea ninguna heurística, lo que renderizaría un label `" — 8.90€"`. Hoy no ocurre con productos 127-132, pero como salvaguarda defensiva podemos hacer fallback al nombre del producto:
```ts
label: proteinKey ? `${t(proteinKey)} — ${p.price.toFixed(2)}€` : `${p.name} — ${p.price.toFixed(2)}€`,
```
Lo incluyo en la implementación. Sin cambios adicionales sobre el prompt.

## Validación

- TS build limpio (sin imports muertos, sin `any`).
- Categoría Sopas → 2 cards (Tom Yam, Miso) con 3 variantes cada una y precios desde BD.
- Add to cart de cada variante → producto con id correcto (130/131/132, 127/128/129).
- Una sola llamada `dish_templates?is_active=eq.true` cacheada 1h.
- Si `dishTemplates` no ha resuelto, el bloque devuelve `[]` sin crashear.

## Fuera de scope

NOODLE_CARDS, RICE_CARDS, VARIANT_GROUPS, `SoupCustomizer.tsx`, BD/RLS/edge functions, regeneración de `types.ts`, columna `products.protein_key` (Fase 5/6).
