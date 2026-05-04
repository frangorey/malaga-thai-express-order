## Encargo: Rediseño visual de cards en WaiterPanel

Verificado contra el código actual: todos los anclajes existen (`formatElapsed` línea 47, tick `setInterval(..., 1000)` línea 180, `filteredOrders.map` línea 482, `getPriorityClassName` aplicado en línea 489, contador en línea 515, bloque `hasCriticalNote` línea 562, bloque pedagógico `isReceived` línea 584). El componente `Collapsible` ya existe en `src/components/ui/collapsible.tsx`.

Solo se modifican **2 archivos**: `src/pages/WaiterPanel.tsx` y `src/contexts/LanguageContext.tsx`. Sin nuevas dependencias, sin tocar lógica.

### PASO 1 — `LanguageContext.tsx`
Añadir al final de cada uno de los 5 bloques (`es`, `en`, `fr`, `de`, `ru`) las 3 keys nuevas con los textos exactos del prompt:
- `waiter.card.instructions.toggle`
- `waiter.card.time.now`
- `waiter.card.time.minutesAgo`

Sin renombrar ni borrar keys existentes.

### PASO 2 — `WaiterPanel.tsx`: imports
- Añadir a lucide-react: `AlertTriangle`, `StickyNote`, `HelpCircle`, `ChevronDown`.
- Añadir `import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';`.

### PASO 3 — `formatElapsed` solo minutos + i18n
Reemplazar la función actual (líneas 47–52) por la nueva firma `(createdAt, t) => string` que devuelve `t('waiter.card.time.now')` o `t('waiter.card.time.minutesAgo').replace('{{minutes}}', ...)`. Actualizar la única llamada interna (línea 515) a `formatElapsed(order.created_at, t)`.

### PASO 4 — Tick 1s → 5s
En el `useEffect` de la línea 180, cambiar `1000` por `5000`. Nada más en ese efecto. El polling de 8s y la alarma se dejan intactos.

### PASO 5 — Rediseño JSX de cada card
Dentro del `filteredOrders.map` (a partir de línea 482), antes del `return`, calcular: `priority`, `leftBorderClass`, `pulseClass`, `timerColorClass`, `criticalNote` (según el bloque del prompt).

Reemplazar todo el bloque `<Card>...</Card>` actual por la nueva estructura del prompt:
- Franja superior roja full-width solo si `criticalNote` (alergia).
- Zona identidad + timer grande (texto coloreado por prioridad, `pulseClass` solo en prioridad 3).
- Meta discreta en una línea (número, fuente WhatsApp/Web, hora, cliente, teléfono, status badge).
- Lista de items con cantidad/nombre/subtotal.
- Nota no crítica en ámbar (solo si `notes` y no `criticalNote`).
- Total alineado derecha.
- Botón primario grande (`h-14`) según `order_status` (received/confirmed/ready) con sus handlers actuales sin cambios.
- Si `isReceived`: `Collapsible` cerrado por defecto con trigger `t('waiter.card.instructions.toggle')` que despliega los 4 pasos (`new_order_step_1..4`) sin el título naranja antiguo.
- Botón "Cancelar" ghost discreto a la derecha (mismos setters del modal existente).

La franja lateral de 12px se aplica con `border-l-[12px]` + `leftBorderClass` en la `Card`.

Eliminar:
- Bloque viejo de hora + "(hace Xm YYs)" + mensaje de prioridad inline.
- Bloque naranja siempre visible `⚠️ NUEVO PEDIDO — ACCIÓN REQUERIDA` (los 4 pasos pasan al Collapsible).
- Rama `hasCriticalNote` dentro de CardContent (la alergia solo va en franja superior).

Mantener `getPriorityMessageKey` y `getPriorityClassName` en el archivo aunque dejen de usarse (no es crítico eliminarlas, evitamos efectos colaterales).

### Restricciones respetadas
- No se tocan: `calculatePriority`, `calculateOrderETA`, `CATEGORY_ETA_MINUTES`, `fetchOrders`, realtime, polling, handlers de confirm/ready/delivered/cancel, diálogo de cancelación, `FloorPlanView`, `TableDetailDrawer`, lógica `floor`/`list`, alarma sonora, interfaz `Order`, queries Supabase, auth/roles.
- No se añaden dependencias ni archivos nuevos.
- Solo 2 archivos modificados.
