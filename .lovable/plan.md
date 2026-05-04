## Plan: Cascada de fallback vídeo → imagen → placeholder

Aplica el plan del cerebro técnico tal cual. Sin modificaciones, ya está bien optimizado.

### Cambios

**1. `src/components/VideoMenuCard.tsx`**
- Props: `videoUrl: string | null`, añadir `imageUrl?: string | null`.
- Importar `ImageOff` de `lucide-react`.
- Reemplazar el `<video>` de fondo por render condicional: video / `<img>` / placeholder con `ImageOff`.
- Guards `if (!videoUrl) return;` en los dos `useEffect` (lazy-load y play/pause).
- Resto intacto (overlay, badges, botones, variantes).

**2. `src/components/VideoMenuItemCard.tsx`**
- Mismo patrón: `videoUrl: string | null`, `imageUrl?: string | null`, `ImageOff`, render condicional, guards en useEffect.

**3. `src/components/TikTokStyleMenu.tsx`**
- `FeaturedItem.videoUrl: string | null`, añadir `imageUrl?: string | null`.
- Pasar `imageUrl={item.imageUrl}` al `<VideoMenuCard>`.

**4. `src/pages/Index.tsx`** — `useMemo videoItems`:
- ARROCES: añadir `imageUrl: firstRice.image_url`.
- TALLARINES: añadir `imageUrl: firstProduct?.image_url ?? null`.
- SOPAS: `videoUrl: primary.video_url ?? null` + `imageUrl: primary.image_url`.
- ENTRANTES agrupado: `videoUrl: primary.video_url ?? null` + `imageUrl: primary.image_url`.
- ENTRANTES suelto: `videoUrl: p.video_url ?? null` + `imageUrl: p.image_url`.
- Default map: `videoUrl: p.video_url ?? null` + `imageUrl: p.image_url`.
- Mantener `FALLBACK_VIDEO_URL` (lo usan Finos/Glass en NOODLE_CARDS).

**5. `src/utils/mockVideoItems.ts`**
- Eliminar `TEMP_VIDEO_URL`.
- Interfaz local: `videoUrl: string | null`, `imageUrl?: string | null`.
- Objeto: `videoUrl: null`, `imageUrl: null`.

### Restricciones
- No tocar Hero, BD, edge functions, i18n, drawers.
- Sin nuevas deps (`ImageOff` ya en lucide-react).

### Verificación
- Entrantes sin video con imagen → foto estática.
- Sin nada → fondo `bg-muted` con icono `ImageOff`.
- Con video → autoplay/pause por viewport como hoy.
- TS compila.