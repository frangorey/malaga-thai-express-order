# Refactor Fase 2C — RiceCustomizerDrawer (Opción B)

Replicar en `RiceCustomizerDrawer` el patrón ya consolidado en Fase 2B (`NoodleCustomizerDrawer`). La card única de Arroces se divide en dos: "🍚 Arroz Frito" y "🍛 Arroz Curry", cada una abriendo el Drawer con su `riceType`.

## Archivos modificados

1. `src/components/RiceCustomizerDrawer.tsx` (reescrito)
2. `src/pages/Index.tsx` (state + RICE_CARDS + montaje del Drawer)
3. `src/contexts/LanguageContext.tsx` (+2 claves en es/en/fr/de/ru)

NO se tocan: `RiceCustomizer.tsx` (legacy), `NoodleCustomizerDrawer.tsx`, `SoupCustomizer.tsx`, `useDishTemplate.ts`, `types.ts`, ni la BD.

## 1) `RiceCustomizerDrawer.tsx`

- Exporta `export type RiceType = "frito" | "curry";`
- Props: añade `riceType: RiceType`.
- Constantes top-level:
  ```ts
  const RICE_LABELS: Record<RiceType, string> = { frito: "Arroz Frito", curry: "Arroz Curry" };
  const RICE_EMOJI:  Record<RiceType, string> = { frito: "🍚", curry: "🍛" };
  const RICE_SLUG_MAP: Record<RiceType, string> = { frito: "arroz_frito", curry: "arroz_curry" };
  ```
- Sustituye `useProducts()` por:
  ```ts
  const slug = RICE_SLUG_MAP[riceType];
  const { data: bundle, isLoading, isError } = useDishTemplate(slug);
  const { imageUrl, videoUrl } = useMemo(() => resolveMedia(bundle), [bundle]);
  const templateProducts = bundle?.products ?? [];
  ```
  Eliminar el import `useProducts`. Añadir `Loader2, ImageOff` desde `lucide-react`.
- Salsas filtradas por riceType:
  ```ts
  const SAUCES_BY_RICE_TYPE: Record<RiceType, SauceOption[]> = {
    frito: [
      { id: "classic",  name: t("sauce_classic"),  dbSubcategory: "Classic",  color: "bg-amber-500" },
      { id: "original", name: t("sauce_original"), dbSubcategory: "Original", color: "bg-green-600" },
    ],
    curry: [
      { id: "curry-amarillo", name: t("yellow_curry_sauce"), dbSubcategory: "Curry Amarillo", color: "bg-yellow-400" },
      { id: "curry-verde",    name: t("green_curry_sauce"),  dbSubcategory: "Curry Verde",    color: "bg-emerald-500" },
      { id: "curry-rojo",     name: t("red_curry_sauce"),    dbSubcategory: "Curry Rojo",     color: "bg-red-500" },
    ],
  };
  const sauces = SAUCES_BY_RICE_TYPE[riceType];
  ```
- `useEffect([riceType])` → llama `handleReset()` para limpiar selecciones y volver a paso `protein` al cambiar de tipo.
- `findMatchingProduct` reescrito sobre `templateProducts` con dos `proteinMap` (frito usa "con pollo/ternera/gambas", curry usa "y pollo/ternera/gambas" para mono-proteínas; los MIX comparten patrón). Match final:
  ```ts
  templateProducts.find(p =>
    p.subcategory === subcategory &&
    p.name.toLowerCase().includes(pattern.toLowerCase())
  ) ?? null
  ```
- Hero multimedia (idéntico patrón a NoodleCustomizerDrawer): `relative aspect-video bg-black overflow-hidden` con video `object-contain bg-black` → fallback img → fallback `ImageOff`.
- Estados loading / error / empty (con i18n `error_loading_variants`, `error_no_variants_available` + fallbacks inline) envolviendo el switch de pasos.
- `DrawerTitle`: `{RICE_EMOJI[riceType]} {RICE_LABELS[riceType]}`.
- En el bloque `summary`, fila Tipo: `Arroz {RICE_LABELS[riceType]}`.
- Botón final con `disabled={isLoading || isError || templateProducts.length === 0}`.
- Resto intacto: stepper, vegetales, extras (sauceExtras + complementExtras), sticky total, `handleAddToCart`, toast, tokens shadcn.

## 2) `src/pages/Index.tsx`

- `import { RiceCustomizerDrawer, RiceType } from "@/components/RiceCustomizerDrawer";`
- Eliminar `const RICE_VIDEO_URL = ...`.
- Reemplazar state:
  ```ts
  const [riceCustomizer, setRiceCustomizer] = useState<{ open: boolean; type: RiceType }>({ open: false, type: "frito" });
  ```
- Añadir junto a `NOODLE_CARDS`:
  ```ts
  const RICE_CARDS: { type: RiceType; subcategoryAnchor: string; displayNameKey: string; emoji: string; videoUrl: string | null }[] = [
    { type: "frito", subcategoryAnchor: "Classic",        displayNameKey: "rice_fried_card", emoji: "🍚",
      videoUrl: "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/arroz-video.mp4" },
    { type: "curry", subcategoryAnchor: "Curry Amarillo", displayNameKey: "rice_curry_card", emoji: "🍛", videoUrl: null },
  ];
  ```
- Reemplazar el bloque `if (dbCategory === "Arroces")` del `useMemo` por un map sobre `RICE_CARDS` (anchor por subcategory, `onCustomize` abre `setRiceCustomizer({ open: true, type: rc.type })`, `displayName` = `${emoji} ${t(displayNameKey)}`).
- Montaje del Drawer:
  ```tsx
  <RiceCustomizerDrawer
    open={riceCustomizer.open}
    onClose={() => setRiceCustomizer((prev) => ({ ...prev, open: false }))}
    onAddToCart={addToCart}
    riceType={riceCustomizer.type}
  />
  ```

## 3) `LanguageContext.tsx` — claves nuevas (5 idiomas, NO italiano)

Añadir junto a las claves `rice_*` existentes en cada bloque de idioma:

| key | es | en | fr | de | ru |
|---|---|---|---|---|---|
| `rice_fried_card` | Arroz Frito | Fried Rice | Riz Sauté | Gebratener Reis | Жареный рис |
| `rice_curry_card` | Arroz Curry | Curry Rice | Riz au Curry | Curry-Reis | Рис с карри |

Idiomas activos confirmados en el archivo: **es, en, fr, de, ru**. Se ignora deliberadamente la mención a `it` del prompt original (es un error del Arquitecto).

## Validación post-cambio

1. TypeScript build limpio.
2. Categoría Arroces muestra exactamente 2 cards.
3. Drawer "Frito" → vídeo `arroz-video.mp4`, salsas Classic/Original.
4. Drawer "Curry" → fallback `ImageOff` (videoUrl=null, image_url posiblemente null), salsas Amarillo/Verde/Rojo.
5. Cambiar de "Frito" a "Curry" resetea selección y vuelve a paso protein.
6. Add to cart genera SupabaseProduct con id real de BD.
7. Sin imports muertos (`useProducts` fuera del Drawer).

## Notas

- `rice_customizer_title` queda obsoleto en el Drawer pero no se elimina del contexto (puede usarse en otros sitios; no es esta fase).
- Teriyaki sigue oculto (no está en `SAUCES_BY_RICE_TYPE`, sus productos tienen `is_available=false` y el hook ya filtra).
- Sin cambios de schema ni regeneración de `types.ts`.
