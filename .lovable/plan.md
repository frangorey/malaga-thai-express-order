## Fase 4 — Ensaladas (frontend)

Asume que el seed SQL (6 `dish_templates` + UPDATE `products.template_id`) ya está aplicado, según la verificación previa. Si la BD aún no está sembrada, primero ejecutamos esa migración antes del frontend.

### 1) Nuevo archivo: `src/components/SaladCustomizerDrawer.tsx`

Replica simplificada del patrón `NoodleCustomizerDrawer` (mismo layout: hero + zona scroll + sticky total), reducida a un único paso "proteína" + summary.

- Imports: `useState`, `useMemo`, `Drawer*`, `Button`, `ShoppingCart`, `X`, `Loader2`, `ImageOff`, `useLanguage`, `SupabaseProduct`, `useDishTemplate`, `resolveMedia`, `useToast`, `cn`.
- Exports: `type SaladType = "cesar" | "classic" | "crispy" | "fruta" | "malaysia" | "thailandia"` + componente.
- Constantes módulo: `SALAD_LABELS`, `SALAD_SLUG_MAP` (slugs `ensalada_<type>`), `SALAD_EMOJI = "🥗"`.
- Estado: `selectedProtein: ProteinId | ""`.
- 4 opciones proteína: `normal` (10.40, 🌱), `pollo` (11.40, 🍗), `langostino` (12.90, 🦐), `mixta` (14.40, 🍗🦐). Labels vía `t("salad_protein_*")`.
- Hero: solo imagen (no `<video>`, los templates de ensaladas tienen `video_url=NULL`). Fallback `<ImageOff>` si no hay imagen.
- Estados: `isLoading` (spinner), `isError` (`error_loading_variants`), `templateProducts.length===0` (`error_no_variants_available`).
- Render proteínas: grid 1 col (sm:2). Botón seleccionado con `border-primary bg-primary/10`. Tras seleccionar, summary card con tipo/proteína/total y CTA full-width "Añadir al carrito".
- Sticky bottom con total cuando hay selección.

**Matching (`findMatchingProduct`)** — único punto delicado, orden por especificidad:

```ts
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const isMixta = (n: string) => /\bmixta\b/.test(n);
switch (selectedProtein) {
  case "mixta":      return isMixta(n);
  case "normal":     return p.is_vegetarian === true;
  case "pollo":      return !isMixta(n) && /\bcon pollo\b/.test(n);
  case "langostino": return !isMixta(n) && /\bcon langostino\b/.test(n);
}
```

La exclusión explícita de "mixta" en pollo/langostino evita el falso positivo (el nombre de la mixta contiene también "con pollo y langostino").

`handleAddToCart`: llama a `findMatchingProduct()`, si null → toast error; si OK → `onAddToCart(base)`, reset `selectedProtein`, `onClose()`, toast éxito. Sin customizations (no hay verduras/extras).

### 2) Modificar `src/pages/Index.tsx`

- Añadir import `SaladCustomizerDrawer`, `SaladType`.
- Añadir state: `const [saladCustomizer, setSaladCustomizer] = useState<{open:boolean; type:SaladType}>({open:false, type:"cesar"})`.
- Añadir constante `SALAD_CARDS` (6 entradas en orden cesar → classic → crispy → fruta → malaysia → thailandia, todas con emoji 🥗 y `displayNameKey: "salad_<type>_card"`).
- Dentro de `videoItems` useMemo, **antes** del bloque Default y junto al bloque `Sopas`, añadir rama `if (dbCategory === "Ensaladas")` que itera `SALAD_CARDS`, resuelve `templatesBySlug.get(sc.slug)`, filtra `categoryProducts.filter(p => p.template_id === template.id)`, elige `primary = group.find(p=>p.is_vegetarian) ?? group[0]`, y push de `FeaturedItem` con `videoUrl: null`, `posterUrl/imageUrl` desde el template, `onCustomize: () => setSaladCustomizer({open:true, type:sc.type})`, `customizeLabel: \`${t("customize")} 🥗\``.
- Añadir `<SaladCustomizerDrawer ... />` junto a los otros drawers, antes del cierre de `<main>`.

Resultado UX: la categoría Ensaladas pasa de 24 cards sueltas a 6 cards agrupadas con drawer.

### 3) Modificar `src/contexts/LanguageContext.tsx`

Añadir 11 claves nuevas en cada uno de los 5 bloques (`es / en / fr / de / ru`, **NO italiano**):

- 6 cards: `salad_cesar_card`, `salad_classic_card`, `salad_crispy_card`, `salad_fruta_card`, `salad_malaysia_card`, `salad_thailandia_card` (traducciones según tabla del prompt).
- 5 auxiliares drawer: `salad_choose_protein`, `salad_protein_veggie`, `salad_protein_chicken`, `salad_protein_shrimp`, `salad_protein_mix`.

**Atención — colisión detectada**: ya existen claves `salad_protein_chicken` y `salad_protein_shrimp` (líneas 394–397, 929–932, etc.) usadas por el legacy `SaladCustomizer.tsx` con valores como "Añadir Pollo". El spec las quiere sobrescribir a "Con pollo" / "Con langostino". Como `SaladCustomizer.tsx` es código muerto (confirmado por el spec, limpieza en Fase 6), **sobrescribimos** los valores existentes en lugar de duplicar la clave. Las claves auxiliares restantes (`salad_choose_protein`, `salad_protein_veggie`, `salad_protein_mix`) se añaden nuevas.

Reutilizamos sin tocar: `add_to_cart`, `customize`, `step_protein`, `order_summary`, `error_loading_variants`, `error_no_variants_available` (ya existen en los 5 idiomas).

### Restricciones

- No tocar: `SoupCustomizer.tsx`, `NoodleCustomizerDrawer.tsx`, `RiceCustomizerDrawer.tsx`, `PokeCustomizer.tsx`, `SaladCustomizer.tsx` (legacy), `useDishTemplate.ts`, `useDishTemplates.ts`, `useProducts.tsx`.
- No añadir italiano.
- No modificar el bloque Default de `videoItems`.

### Validación

1. `SaladCustomizerDrawer.tsx` existe, no importa `SaladCustomizer.tsx`.
2. `Index.tsx`: import + state + `SALAD_CARDS` (6 entradas, orden correcto) + rama `Ensaladas` antes del Default + `<SaladCustomizerDrawer />` montado.
3. `tsc` limpio.
4. QA manual con los 4 tests del checklist (especialmente Test 4 — Mixta — para verificar prioridad del regex sobre los substrings "con pollo"/"con langostino").
