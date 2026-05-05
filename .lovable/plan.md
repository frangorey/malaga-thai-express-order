# Fase 6 — Pestaña "Plantillas" en AdminPanel

Añadir una 5ª pestaña al `Tabs` de `src/pages/AdminPanel.tsx` que permita subir/cambiar `image_url` y `video_url` de los 16 `dish_templates` activos. Solo upload de media — sin crear, borrar ni editar otros campos.

## Verificación previa

- `dish_templates` ya tiene `image_url`, `video_url`, `slug`, `display_name`, `category`, `customizer_key`, `display_order`, `is_active` (confirmado en schema).
- Bucket `Fotos_Thaii` existe y es público.
- RLS: `dish_templates_update_admin` permite UPDATE solo a admins → coherente con el guard `isAdmin` ya existente en `AdminPanel.tsx`.
- El archivo ya importa `supabase`, `toast`, `Tabs`, `Card`, `Input`, etc. — no hacen falta imports nuevos salvo `Layers` de lucide-react.

## Cambios en `src/pages/AdminPanel.tsx`

1. **Import lucide-react**: añadir `Layers` al import existente.
2. **Tipo + emoji map**: añadir `interface Template` y `TEMPLATE_EMOJI_MAP` (16 slugs) tras `interface Product`.
3. **Estado**: 4 nuevos `useState` (`templates`, `templateSearch`, `uploadingTemplateImageId`, `uploadingTemplateVideoId`).
4. **Fetch**: llamar `fetchTemplates()` en el `useEffect` admin junto a `fetchOrders` / `fetchProducts`.
5. **`fetchTemplates`**: SELECT activos ordenados por `display_order`.
6. **`handleTemplateImageUpload`**: valida tipo imagen + 5MB, sube a `templates/{id}-{ts}.{ext}`, hace `UPDATE dish_templates SET image_url`.
7. **`handleTemplateVideoUpload`**: valida MP4 + 5MB, sube a `templates/videos/{id}-{ts}.mp4`, hace `UPDATE dish_templates SET video_url`.
8. **`filteredTemplates`**: filtro local por display_name / category / slug.
9. **TabsTrigger** "Plantillas" con icono `Layers`, insertado antes de `layout`.
10. **TabsContent** replicando la estructura de la pestaña "photos" (grid responsive, doble cuadro foto/vídeo, dos labels de upload, info hint), insertado entre `photos` y `qrs`.

## Detalles técnicos clave

- IDs de templates son `uuid` (string) — los estados `uploading*Id` usan `string | null`, no `number`.
- `upsert: true` en `supabase.storage.upload` para sobrescribir media anterior del mismo template (mismo timestamp evita colisión, pero por seguridad).
- Toast de éxito tras update; `fetchTemplates()` para refrescar el grid.
- Hint indica al admin que el media subido se propaga a todos los productos vinculados vía `template_id` (consumido por `useDishTemplate` / `resolveMedia`).

## Restricciones respetadas

- No se tocan otros tabs (orders, photos, qrs, layout).
- No se modifican migrations ni `src/integrations/supabase/`.
- Strings hardcoded en español (consistente con el archivo).
- Tailwind/shadcn idéntico a la pestaña "photos".

## Validación post-implementación

- TS compila limpio.
- `/admin` muestra 5 pestañas; "Plantillas" lista 16 cards ordenados por `display_order`.
- Subir foto/vídeo en una card actualiza la BD y, tras invalidación de cache de `useDishTemplate`, los Customizers (Soup, Noodle, Rice, Salad, Tonkatsu, PolloCoreano) reflejan el nuevo media.

## Fuera de scope

- No se añade gestión de creación/borrado de templates.
- No se añaden campos editables (`display_name`, `slug`, etc.).
- No se invalida manualmente la cache de React Query — se confiará en `staleTime` (1h) o refresh manual; si se requiere instantáneo, podría añadirse `queryClient.invalidateQueries(['dish_template'])` en una fase posterior.
