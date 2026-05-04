## Plan: Encargo 7 — Sistema de prioridad visual de pedidos

Especificación verificada contra el código actual: todos los anclajes existen literalmente en `src/pages/WaiterPanel.tsx` (línea 61 `hasCriticalNote`, 284 `filteredOrders`, 405 `className` de Card, 431 contador `(hace ...)`). No requiere optimización adicional.

Solo se modifican **dos archivos**: `src/contexts/LanguageContext.tsx` y `src/pages/WaiterPanel.tsx`.

### PASO 1 — `src/contexts/LanguageContext.tsx`
Añadir las **10 claves nuevas** (`priority_received_*`, `priority_kitchen_*`, `priority_ready_*`) al final de cada uno de los 5 bloques (`es`, `en`, `fr`, `de`, `ru`) con los textos exactos facilitados.

### PASO 2 — `WaiterPanel.tsx`: helpers fuera del componente
Justo después del cierre de `hasCriticalNote` (línea 61+), añadir:
- `CATEGORY_ETA_MINUTES` (mapa por categoría).
- `calculateOrderETA(items)` — ETA máxima + 5 min + 5 si ≥8 items.
- `calculatePriority(order)` — devuelve 0/1/2/3 según `order_status`, `order_type` y minutos transcurridos.
- `getPriorityClassName(priority)` — clases de borde Tailwind (verde / amarillo / naranja / rojo+pulse).
- `getPriorityMessageKey(order, priority)` — devuelve la clave i18n correspondiente o `null`.

### PASO 3 — `WaiterPanel.tsx`: ordenación
Sustituir `filteredOrders` (línea 284) por la versión que aplica `.slice().sort()` por prioridad descendente y, a igualdad, por `created_at` ascendente.

### PASO 4 — `WaiterPanel.tsx`: borde dinámico de la Card
En la línea 405, sustituir el `className` actual por:
```
className={`border-2 transition-colors ${getPriorityClassName(calculatePriority(order))}`}
```

### PASO 5 — `WaiterPanel.tsx`: mensaje de prioridad junto al contador
Tras el `</span>` del contador (línea 431-433), insertar el IIFE que renderiza `· {t(messageKey)}` con color (`text-yellow-600` / `text-orange-500` / `text-red-600 font-bold`) cuando la prioridad es ≥ 1.

### Restricciones respetadas
- No se crean nuevos `setInterval` ni `useEffect`; el tick existente garantiza el refresco por segundo.
- No se modifican `fetchOrders`, `handleConfirmOrder`, `handleMarkReady`, `handleMarkDelivered`, `handleCancelOrder`, `formatElapsed`, `hasCriticalNote` ni `CRITICAL_WORDS`.
- El bloque pedagógico naranja (`bg-orange-50`) interior permanece intacto; solo cambia el borde del Card padre.
- Solo se tocan los dos archivos indicados.
