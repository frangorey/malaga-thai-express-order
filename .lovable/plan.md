# Plan urgente: bajar egress YA (sin pagar Supabase Pro)

Objetivo: que mañana la web cargue sin consumir egress de Supabase Storage ni saturar la base de datos. Todo se hace desde el código, sin necesidad de migrar assets a otro proveedor hoy.

## Qué se va a cambiar

### 1. Vídeos: NO autoplay, NO autodescarga
Hoy `VideoMenuCard` empieza a descargar el MP4 en cuanto la card aparece en pantalla (60% visible). Con TikTokStyleMenu desplazándose, eso son varios MB por scroll y por usuario → es la causa principal de los 18 GB.

Cambios en `src/components/VideoMenuCard.tsx`:
- Quitar la lógica que hace `setVideoSrc(videoUrl)` al entrar en viewport.
- Mostrar SOLO el `posterUrl` (imagen) por defecto, con un icono ▶ encima.
- El vídeo solo se carga y reproduce cuando el usuario hace tap en el botón play.
- Mantener `preload="none"` y añadir `crossOrigin` correcto.

Resultado: el 95% de los visitantes nunca descargará un vídeo.

### 2. Poster real (no SVG negro de 1×1)
Hoy el poster por defecto es un cuadrado negro, así que mientras no hay vídeo se ve una card vacía. Cambios:
- En `src/pages/Index.tsx` y `src/utils/mockVideoItems.ts`: usar `product.image_url` cuando exista, y un poster JPG real (servido desde `/public`, no Supabase) como fallback.
- Añadir `/public/poster-fallback.jpg` (imagen ligera <30KB) para usar como fallback genérico.

### 3. Cache local del menú (reduce queries a la BD)
Hoy `useProducts` hace SELECT a `products` cada vez que alguien abre la web. Cambios en `src/hooks/useProducts.tsx`:
- Guardar el resultado en `localStorage` con TTL de 1 hora.
- Al montar, servir primero la versión cacheada (UI instantánea) y refrescar en segundo plano.
- Clave: `thaii_menu_v1` con `{ data, timestamp }`.

Esto baja las llamadas a la BD ~90% para usuarios recurrentes y elimina egress de respuestas JSON repetidas.

### 4. Reducir altura de imágenes en `imageOptimization.ts`
Revisar `src/lib/imageOptimization.ts`: si está pidiendo imágenes a tamaño completo desde Supabase Storage, forzar URLs con parámetros `?width=…&quality=70` solo cuando el plan lo permita; mientras tanto, añadir `loading="lazy"` y `decoding="async"` en todos los `<img>` de menú (ResponsiveImage).

### 5. Quitar Supabase Storage del hero/landing
El hero usa `FALLBACK_VIDEO_URL` de Supabase. Lo sustituimos por:
- Un poster JPG en `/public/hero-poster.jpg` para la portada.
- Sin vídeo de fondo automático en móvil (la mayoría de tráfico).

## Archivos que voy a tocar

- `src/components/VideoMenuCard.tsx` — tap-to-play, sin auto-load
- `src/hooks/useProducts.tsx` — cache localStorage 1h
- `src/pages/Index.tsx` — usar posters reales
- `src/utils/mockVideoItems.ts` — quitar URL de vídeo por defecto
- `src/components/Hero.tsx` — quitar vídeo Supabase del hero
- `src/lib/imageOptimization.ts` — lazy loading agresivo
- `public/poster-fallback.jpg` — nueva imagen genérica (la genero yo)

## Lo que NO se hace en este plan (queda para después)

- Migrar a Cloudflare R2 / Bunny (requiere que tú crees cuenta, ~30 min)
- Recomprimir los MP4 originales en Storage (requiere reupload manual)
- Estos pasos los hacemos cuando vuelvas a tener tiempo; el plan de hoy ya debería bajar el egress >90%.

## Resultado esperado

- Egress diario: de ~2-3 GB/día a <100 MB/día.
- La web carga aunque Supabase siga restringida (cache local del menú).
- Hasta el día 5/mayo (cuando se renueva la cuota), la app funciona en modo "fotos + tap para vídeo".

¿Procedo a implementarlo?
