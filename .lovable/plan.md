## Refactor NoodleCustomizerDrawer.tsx — Fase 2B

Único archivo modificado: `src/components/NoodleCustomizerDrawer.tsx`. Mismo patrón ya validado en `SoupCustomizer.tsx` (Fase 2A).

### Cambios

**1. Imports**
- Eliminar `useProducts`.
- Añadir `useDishTemplate, resolveMedia` desde `@/hooks/useDishTemplate`.
- Añadir `Loader2, ImageOff` al import existente de `lucide-react`.

**2. Mapa slug**
Junto a `NOODLE_LABELS`:
```ts
const NOODLE_SLUG_MAP: Record<NoodleType, string> = {
  Anchos: "tallarines_anchos",
  Finos:  "tallarines_finos",
  Glass:  "tallarines_glass",
  Udon:   "tallarines_udon",
};
```

**3. Sustitución del fetch en el componente**
Reemplazar `const { products } = useProducts();` por:
```ts
const slug = NOODLE_SLUG_MAP[noodleType];
const { data: bundle, isLoading, isError } = useDishTemplate(slug);
const { imageUrl, videoUrl } = useMemo(() => resolveMedia(bundle), [bundle]);
const templateProducts = bundle?.products ?? [];
```

**4. `findMatchingProduct` sin filtros category/subcategory**
Mantengo el `proteinMap` REAL del archivo actual (literal, sin el typo "tenera" del ejemplo del Arquitecto):
```ts
const proteinMap: Record<string, string> = {
  pollo: "con pollo",
  ternera: "con ternera",
  gambas: "con gambas",
  pollo_ternera: "MIX 2 con pollo y ternera",
  pollo_gambas: "MIX 2 con pollo y gambas",
  ternera_gambas: "MIX 2 con ternera y gambas",
  pollo_ternera_gambas: "MIX 3 con pollo, ternera y gambas",
};
```
Lookup pasa a `templateProducts.find(...)` solo por nombre (proteinPattern + saucePattern). Guard `templateProducts.length === 0 → return null`.

**5. Hero multimedia**
Insertar antes del bloque de progress steps (`<div className="flex items-center gap-1 px-4 py-3 ...">`):
- Si `videoUrl`: `<video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-contain bg-black" src={videoUrl} />` dentro de un wrapper `relative aspect-video bg-black overflow-hidden`.
- Si solo `imageUrl`: `<img src={imageUrl} alt={...} className="absolute inset-0 w-full h-full object-contain bg-black" loading="lazy" />`.
- Fallback: `ImageOff` centrado sobre `bg-muted`.

Convención `object-contain bg-black` respeta la regla aplicada anteriormente en `VideoMenuCard` / `VideoMenuItemCard`.

**6. Estados loading / error / empty en el scroll**
Al inicio del contenedor scroll, antes de los bloques `currentStep === ...`:
- `isLoading`: spinner `Loader2` centrado.
- `isError`: mensaje `t("error_loading_variants") || "No pudimos cargar las variantes. Recarga la página."`.
- `!isLoading && !isError && templateProducts.length === 0`: `t("error_no_variants_available") || "No hay variantes disponibles ahora mismo."`.

Envolver los bloques actuales `currentStep === "protein" | "sauce" | "vegetables" | "extras" | "summary"` con la condición combinada `!isLoading && !isError && templateProducts.length > 0`.

**7. Botón Add to cart**
Añadir `disabled={isLoading || isError || templateProducts.length === 0}` al botón final del summary.

### NO se toca
- `src/pages/Index.tsx`, `NoodleCustomizer.tsx` (legacy), `useDishTemplate.ts`, otros customizers.
- Firma del componente, export `NoodleType`, lógica de pasos, vegetales, extras, `handleAddToCart` (excepto la nueva `findMatchingProduct`).
- i18n: solo se usan claves existentes con fallback inline. No se añaden claves nuevas (la clave `error_no_variants_available` puede no existir aún → cae al fallback string, que es seguro).

### Notas
- Se conserva el `proteinMap` real del archivo. Ignoro deliberadamente el typo "tenera" del ejemplo ilustrativo del Arquitecto.
- `useProducts` queda totalmente eliminado del archivo (no quedan imports muertos).
- TS estricto: `templateProducts` tipado vía `bundle?.products` que ya es `SupabaseProduct[]`.
