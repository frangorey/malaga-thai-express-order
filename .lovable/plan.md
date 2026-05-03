## Plan: Encargos 3-5 — Contador en vivo, notas críticas y bloque pedagógico

Se modificarán únicamente dos archivos: `src/contexts/LanguageContext.tsx` y `src/pages/WaiterPanel.tsx`. La especificación recibida es coherente con el código actual (verificado: `useLanguage`/`t` ya están importados, los bloques de notas y el botón `isReceived` con `variant="neon"` existen tal como se describen). No se requiere ninguna optimización adicional.

### PASO 1 — `src/contexts/LanguageContext.tsx`
Añadir 6 claves nuevas al final de cada uno de los 5 bloques de idioma (`es`, `en`, `fr`, `de`, `ru`):
- `new_order_action_title`
- `new_order_step_1` … `new_order_step_4`
- `confirm_in_kitchen_button`

Textos exactos según lo facilitado por el cerebro técnico (incluyendo emojis ⚠️ y ✅).

### PASO 2 — `src/pages/WaiterPanel.tsx`: contador en vivo (Encargo 3)
- Añadir helper **fuera** del componente:
  ```ts
  const formatElapsed = (createdAt: string): string => { ... }
  ```
- Dentro del componente: estado `tick` + `useEffect` con `setInterval(1000)` para forzar re-render cada segundo.
- En el `CardHeader` de cada pedido, junto a `📅 Pedido: HH:mm:ss`, añadir `(hace Xm YYs)` usando `formatElapsed(order.created_at)`.

### PASO 3 — `src/pages/WaiterPanel.tsx`: notas críticas (Encargo 4)
- Añadir **fuera** del componente la constante `CRITICAL_WORDS` (alergias, gluten, celiaco, intolerancias, vegano/vegetariano, embarazo, picante) y el helper `hasCriticalNote(notes)`.
- Sustituir el bloque actual de notas por una versión con dos estilos:
  - Crítica → fondo rojo (`bg-red-50`/`border-red-200`/`text-red-700`) con `🚨 ⚠️`.
  - Normal → fondo ámbar (`bg-amber-50`/`border-amber-200`/`text-amber-800`) con `⚠️ 📝`.

### PASO 4 — `src/pages/WaiterPanel.tsx`: bloque pedagógico (Encargo 5)
Sustituir el botón único actual del estado `isReceived` por:
- Un panel naranja con el título `t('new_order_action_title')` y una lista numerada con los 4 pasos (`new_order_step_1..4`).
- El botón `variant="neon"` mantiene `handleConfirmOrder`, pero su label pasa a `t('confirm_in_kitchen_button')` (manteniendo `'Tramitando...'` durante la operación).

### Restricciones que se respetarán
- Solo se tocan los dos archivos indicados.
- No se migran strings hardcodeados existentes a `t()` (solo se usan las 6 claves nuevas).
- No se altera `fetchOrders`, `handleCancelOrder`, `handleMarkReady`, `handleMarkDelivered`, ni la lógica de alarma/realtime/polling.
- `formatElapsed`, `hasCriticalNote` y `CRITICAL_WORDS` se declaran fuera del componente.
- `tick` se usa exclusivamente para forzar el re-render por segundo.
