# Refactor Fase 2A — SoupCustomizer desacoplado de IDs hardcoded

## Verificaciones BD (ya completadas)
- `dish_templates`: `sopa_miso` y `sopa_tom_yam` activos, ambos con `video_url` y `image_url=NULL`.
- 6 productos (127–132) vinculados por `template_id`. Veggie con `is_vegetarian=true`; resto contiene "pollo"/"langostino" en `name`.
- `SoupCustomizer` no tiene consumidores externos actualmente → refactor sin riesgo de romper imports.
- `@tanstack/react-query`, `QueryClientProvider` y `sonner` ya disponibles.

## Cambios

### 1. CREAR `src/hooks/useDishTemplate.ts`
Hook + helpers exactamente como en el prompt:
- `useDishTemplate(slug)` con `staleTime` 1h, `gcTime` 2h, `enabled: !!slug`.
- Tipos: `DishTemplate`, `ProteinKey = "pollo" | "langostino" | "veggie"`, `DishTemplateBundle`.
- `resolveVariant(bundle, protein)`: veggie → `is_vegetarian=true`; resto → match case-insensitive en `name`.
- `resolveMedia(bundle)`: `template.image_url` ?? primer `products[].image_url` ?? null; `template.video_url` ?? null.

### 2. REEMPLAZAR `src/components/SoupCustomizer.tsx`
Versión nueva con optimizaciones sobre el prompt original:
- `selectedSoupType: SoupSlug | ""` y `selectedProtein: ProteinKey | ""` (tipado estricto, evita casts).
- Reset de `selectedProtein` al cambiar de sopa.
- `useDishTemplate(selectedSoupType || null)`.
- Imagen de cabecera: `imageUrl` desde `resolveMedia`; placeholder `ImageOff` centrado sobre `bg-muted` cuando es null.
- Step 2: muestra mensaje de error con clave `error_loading_variants` cuando `isError`.
- Botón "Añadir": `disabled` si `isLoading` o variante no resuelta; muestra `Loader2` mientras carga.
- `handleAddToCart`: si `resolvedProduct` es null → `toast.error(t("error_variant_not_found") || "No encontramos esa variante. Inténtalo de nuevo.")`.
- Precio: `resolvedProduct.price` (real de BD) con fallback al estático del array `proteins`.
- Reset completo tras añadir al carrito.

### 3. ACTUALIZAR `src/contexts/LanguageContext.tsx`
Añadir 2 claves nuevas en los 5 idiomas (es, en, fr, de, ru):
- `error_variant_not_found`
- `error_loading_variants`

Textos exactos según los proporcionados por el usuario. El componente mantiene fallback string inline como salvaguarda defensiva.

## Lo que NO se toca
- BD, RLS, migraciones (Fase 0/1 ya aplicadas).
- `src/integrations/supabase/types.ts` (autogenerado).
- Otros customizers (Rice/Noodle/Poke/Salad) — fases posteriores.
- `Index.tsx`, `VideoMenuCard`, `VideoMenuItemCard`, `TikTokStyleMenu`.

## Resultado esperado
SoupCustomizer deja de depender de IDs hardcoded (127–132). Si en BD se añade una nueva variante de sopa, se renombra un producto, o se actualiza precio/media en `dish_templates`, el componente lo refleja sin tocar código.
