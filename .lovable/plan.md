## Fase 5 — Frontend "Otras del Mundo"

Plan revisado del Cerebro técnico. La especificación es coherente con el patrón ya validado (Fases 2–4) y con el esquema BD verificado: templates `tonkatsu` y `pollo_coreano` ya seedeados, productos 269/270 sueltos. No requiere cambios en BD, hooks ni otros customizers.

### Archivos a crear

**1) `src/components/TonkatsuCustomizerDrawer.tsx`**

Réplica de `SaladCustomizerDrawer.tsx` extendida a 2 selectores secuenciales.

- Props: `{ open, onClose, onAddToCart }` — sin prop de tipo (slug fijo `"tonkatsu"`).
- `useDishTemplate("tonkatsu")` + `resolveMedia(bundle)`. Hero preparado para `<video>` (si `videoUrl`) → `<img>` (si `imageUrl`) → `<ImageOff>` fallback. Hoy caerá al fallback hasta que se suba media en Fase 6.
- Estados estándar: `isLoading` (spinner), `isError` (`error_loading_variants`), `templateProducts.length===0` (`error_no_variants_available`).
- Selector 1 — Guarnición: `Arroz Frito` 🍚 / `Fideos Fritos` 🍜.
- Selector 2 — Salsa (visible solo tras elegir guarnición): `Agridulce` (amber) / `Barbacoa` (red).
- Matching: `templateProducts.find(p => p.name.includes(garnishToken) && p.name.includes(sauceToken))`. Seguro por estar prefiltrado por `template_id`.
- Summary card con total fijo 13.50€ + CTA "Añadir al carrito" disabled hasta tener garnish+sauce.
- `useEffect` que limpia selecciones al cerrar (`!open`).
- `handleAddToCart` → toast éxito → `handleClose`. Toast error si `findMatchingProduct()` devuelve null (`error_variant_not_found`).
- DrawerTitle: "🍱 Tonkatsu".

**2) `src/components/PolloCoreanoCustomizerDrawer.tsx`**

Idéntico a Tonkatsu salvo:
- Slug `"pollo_coreano"`.
- Guarnición (3): `Arroz Blanco` 🍚 / `Arroz Japonés` 🍙 (tilde literal, matchToken `"Arroz Japonés"`) / `Patatas Fritas` 🍟.
- Salsa (3): `Agridulce` (amber) / `Miel Mostaza` (yellow) / `Yogur` (sky).
- Total 12.70€. DrawerTitle: "🍗 Pollo Coreano".

### Archivos a modificar

**3) `src/pages/Index.tsx`**

- Imports: `TonkatsuCustomizerDrawer`, `PolloCoreanoCustomizerDrawer`.
- Estados nuevos: `tonkatsuDrawerOpen`, `polloCoreanoDrawerOpen` (booleans).
- Constante `WORLD_CARDS` con 4 entradas (2 `kind:"template"` + 2 `kind:"standalone"`), en el orden del spec: tonkatsu, pollo_coreano, prod 270, prod 269.
- En `videoItems` useMemo, **antes del Default y después del bloque Ensaladas**, añadir rama `if (dbCategory === "Otras del Mundo")` que:
  - Para `template`: resuelve `templatesBySlug.get(slug)`, filtra `categoryProducts` por `template_id`, primer producto como `primary`, push de `FeaturedItem` con `onCustomize` y `customizeLabel`.
  - Para `standalone`: busca `categoryProducts.find(p => p.id === productId)`, push de `FeaturedItem` sin `onCustomize` (cae al botón "Añadir directo" del default del card).
- Montar `<TonkatsuCustomizerDrawer />` y `<PolloCoreanoCustomizerDrawer />` junto a los demás drawers, antes del cierre de `<main>`.

**4) `src/contexts/LanguageContext.tsx`**

Añadir 18 claves nuevas en los 5 bloques `es / en / fr / de / ru` (sin italiano):
- 4 cards: `world_tonkatsu_card`, `world_pollo_coreano_card`, `world_pad_ka_prao_card`, `world_curry_pina_card`.
- 6 Tonkatsu: `tonkatsu_choose_garnish/_garnish_fried_rice/_garnish_fried_noodles/_choose_sauce/_sauce_sweet_sour/_sauce_bbq`.
- 8 Pollo Coreano: `korean_chicken_choose_garnish/_garnish_white_rice/_garnish_japanese_rice/_garnish_fries/_choose_sauce/_sauce_sweet_sour/_sauce_honey_mustard/_sauce_yogurt`.

Si alguna ya existe (improbable), no duplicar. Reutilizar `customize`, `add_to_cart`, `error_loading_variants`, `error_no_variants_available`, `error_variant_not_found`, `order_summary`.

### Optimizaciones aplicadas al spec

1. **Factor común sugerido más adelante** (NO ahora): los dos nuevos drawers son casi idénticos. Para esta fase los duplicamos por velocidad y consistencia con el patrón Salad. La extracción a un `<DishCustomizerDrawer>` parametrizado es candidata natural a Fase 6 junto con la limpieza de `SoupCustomizer.tsx`/`RiceCustomizer.tsx`/`SaladCustomizer.tsx` legacy.
2. **Standalone cards sin `onCustomize`**: confirmado que `TikTokStyleMenu`/`VideoMenuItemCard` ya manejan ese caso con un botón "Añadir" directo (mismo patrón que el bloque Default de Entrantes), así que no hace falta lógica nueva en el card.
3. **`videoUrl` en standalone**: usamos `product.video_url ?? null` (igual que el Default), por si los productos 269/270 reciben video en el futuro.
4. **Detección de proteína**: no aplica aquí (Tonkatsu y Pollo Coreano no tienen variantes de proteína), así que la heurística por nombre de Sopas/Ensaladas no se replica.

### Restricciones

- No tocar BD/RLS, `useDishTemplate`, `useDishTemplates`, `useProducts`.
- No tocar otros customizers (Soup, Noodle, Rice, Salad, Poke).
- No añadir italiano. No tocar el Default de `videoItems`.

### Validación

- TS build limpio.
- "Otras del Mundo" muestra exactamente 4 cards.
- Tonkatsu: 2×2 = 4 combinaciones mapean a productos 271–274.
- Pollo Coreano: 3×3 = 9 combinaciones mapean a productos 275–283.
- Pad Ka Prao y Curry y Piña: añaden directo al carrito sin abrir drawer.
- Bloques previos (Sopas, Tallarines, Arroces, Ensaladas, Entrantes) intactos.
