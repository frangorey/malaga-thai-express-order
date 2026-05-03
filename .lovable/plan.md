## Plan: Modal de cancelación de pedidos en WaiterPanel

Implementación literal del encargo, sin tocar otros archivos ni migrar strings existentes.

### 1. `src/contexts/LanguageContext.tsx`
Añadir las 12 claves nuevas (`cancel_order_button`, `cancel_order_dialog_title`, `cancel_order_dialog_description`, `cancel_reason_select_label`, `cancel_reason_product_unavailable`, `cancel_reason_customer_no_show`, `cancel_reason_order_error`, `cancel_reason_other`, `cancel_reason_other_placeholder`, `confirm_cancel_button`, `back_button`, `order_cancelled_toast`) al final de cada uno de los 5 bloques de idioma (`es` línea 56, `en` 543, `fr` 1029, `de` 1509, `ru` 1989), con los textos exactos provistos.

### 2. `src/pages/WaiterPanel.tsx`
- **Imports nuevos**: `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle`/`DialogDescription`/`DialogFooter`, `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue`, `Textarea`, `Label`, `useLanguage`.
- **Hook**: `const { t } = useLanguage();` junto a los hooks existentes.
- **Estado**: 4 nuevos `useState` — `showCancelModal`, `cancelTargetOrder` (tipado `Order | null`), `cancelReason`, `cancelOtherText`.
- **Función `handleCancelOrder`**: actualiza la orden a `order_status='cancelled'` con `notes` concatenando `[CANCELADO: <motivo>]`. Toast con `t('order_cancelled_toast')`, refresca y limpia el estado del modal.
- **Botón "Cancelar pedido"** dentro del map de cards (vista lista), DESPUÉS de los botones condicionales `isReceived` / `confirmed` / `ready`, mostrado cuando `order_status` no es `cancelled` ni `delivered`. Variante `outline` destructiva, abre el modal y setea `cancelTargetOrder`.
- **`<Dialog>` de cancelación**: añadido al final del return tras `<TableDetailDrawer />`. Contiene `Select` con 4 motivos, `Textarea` condicional para "Otro", botón "Confirmar cancelación" (deshabilitado sin motivo o "Otro" sin texto) y botón "Volver". `onOpenChange` limpia el estado al cerrar.

### Restricciones respetadas
- No se modifica ningún otro archivo.
- No se migran strings hardcodeados existentes a `t()`.
- No se tocan `fetchOrders`, `handleConfirmOrder`, `handleMarkReady`, `handleMarkDelivered`, alarma, realtime ni polling.
- El filtro de `fetchOrders` (`['received','confirmed','preparing','ready']`) ya excluye `cancelled`, por lo que la card desaparece tras cancelar — criterio cumplido sin cambios.

### Notas técnicas (revisión / optimización)
- El prompt original incluía bloques de JSX corruptos por el copy-paste (líneas vacías sin etiquetas). Se reconstruirán siguiendo la intención: `<Button variant="outline" className="w-full mt-2 border-destructive text-destructive hover:bg-destructive/10" size="lg" onClick={...}>` para el disparador, y `<Dialog open={showCancelModal} onOpenChange={...}>` con `<DialogContent>`, `<DialogHeader>`, contenedor `<div className="space-y-3 py-2">` con `<Label>` + `<Select value={cancelReason} onValueChange={setCancelReason}>` y los 4 `<SelectItem value="product_unavailable|customer_no_show|order_error|other">`, más el `<Textarea>` condicional y `<DialogFooter>` con los dos botones descritos.
- `cancelTargetOrder` se tipará como `Order | null` para mantener type-safety con el resto del archivo.
- Sin cambios de schema ni migraciones SQL: la columna `notes` y el valor `'cancelled'` en `order_status` ya existen.
