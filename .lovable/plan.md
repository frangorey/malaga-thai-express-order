## Bloque 1 — i18n keys + WaiterDashboard (sin tocar WaiterPanel)

Solo 2 archivos afectados. No se toca lógica existente, ni `WaiterPanel.tsx`, ni BD/RLS, ni edge functions.

### Archivo 1 — `src/contexts/LanguageContext.tsx` (modificar)

Añadir las 14 keys planas al final de cada uno de los 5 bloques de idioma (`es` línea 572, `en` ~1089, `fr` ~1600, `de` ~2111, `ru` ~2621), justo antes del `},` que cierra cada idioma. Se inserta una coma tras la última key existente y se añaden las 14 nuevas con los textos exactos del prompt:

`dashboard_title`, `dashboard_pickup_title`, `dashboard_pickup_subtitle`, `dashboard_dine_in_title`, `dashboard_dine_in_subtitle`, `dashboard_oldest_label`, `dashboard_minutes_short`, `dashboard_empty`, `dashboard_view_list`, `dashboard_view_floor`, `dashboard_pending_count` (con `{{count}}`), `nav_dashboard`, `nav_list`, `nav_floor`.

Total: 14 × 5 = 70 entradas nuevas. No se renombra ni elimina ninguna key existente. No se toca `t()` ni el Provider.

### Archivo 2 — `src/components/waiter/WaiterDashboard.tsx` (nuevo)

Componente standalone que recibe `orders`, `onNavigate(view)` y `calculatePriority` por props. No importa Supabase ni hooks de datos.

**Nota técnica:** el código TSX que envió el Cerebro Técnico llegó con el JSX corrompido (sin etiquetas entre `>` y los contenidos: `{t(titleKey)}`, `{count}`, etc. quedaron sueltos). Reconstruyo la estructura JSX descrita por la lógica y los className visibles, manteniendo intacto:

- La interfaz `Order` y `WaiterDashboardProps` exactamente como en el prompt.
- `ACTIVE_STATES = ['received','confirmed','preparing','ready']`.
- `computeMetrics(orderType)` idéntica: filtra por `order_type` ∈ {`pickup`,`dine_in`} y status activo, calcula `count`, `maxPriority` (vía `calculatePriority` inyectada) y `oldestMinutes`.
- `getCardClasses` y `getTimerColor` con la paleta de 4 niveles (emerald/amber/orange/red, `animate-pulse` sólo en nivel 3) y rama vacía neutral.
- `renderCard(titleKey, subtitleKey, Icon, metrics, ctaKey, targetView)` que renderiza una `Card` clickable con `border-l-[12px]`, `min-h-[420px]`, padding 8, layout flex column entre cabecera (Icon + título + subtítulo) y bloque central (estado vacío con `CheckCircle2` + `dashboard_empty`, o `count` grande + `dashboard_pending_count` + línea `Clock` con `dashboard_oldest_label: X dashboard_minutes_short` solo si `oldestMinutes > 0`), y footer con `Button` que dispara `onNavigate(targetView)` con `stopPropagation` y muestra `t(ctaKey)` + `ArrowRight`.
- Render final: grid responsive de 2 columnas con la card de Pickup (`ShoppingBag`, `dashboard_view_list`, `'list'`) y la de Dine-In (`UtensilsCrossed`, `dashboard_view_floor`, `'floor'`).
- `export default WaiterDashboard`.

Imports: `useLanguage`, `Card`, `Button`, y de `lucide-react`: `ShoppingBag`, `UtensilsCrossed`, `Clock`, `CheckCircle2`, `ArrowRight`.

### Fuera de alcance (Bloque 2)

`WaiterPanel.tsx` no se modifica en este bloque: el cableado de la nueva vista `dashboard` y el paso de props se hará en el siguiente encargo.

### Verificación

- Build TypeScript limpio.
- `t('dashboard_title')` etc. resuelven en los 5 idiomas.
- Sin nuevas dependencias, sin tocar BD/RLS/edge functions.
