## Cambios a aplicar

Dos ediciones aisladas, una línea cada una. Verificadas contra el código actual: las cadenas a sustituir aparecen exactamente una vez en cada archivo.

### 1. `src/pages/WaiterPanel.tsx` (línea 80)

Reducir la frecuencia de repetición de la alarma sonora del panel de camarero de 12 a 30 segundos para evitar saturación acústica.

- Antes: `}, 12000);`
- Después: `}, 30000);`

El resto del `useEffect` (la primera llamada inmediata a `playLoudAlarm()` en la línea 77 y toda la lógica de cleanup) queda intacto.

### 2. `supabase/functions/create-whatsapp-order/index.ts` (línea 270)

Normalizar el origen del pedido a `'web'` dentro del `INSERT` en `orders`, ya que esta función procesa también pedidos web (mesa, recogida, domicilio) y no solo WhatsApp.

- Antes: `order_source: 'whatsapp',`
- Después: `order_source: 'web',`

Ninguna otra propiedad del insert, ninguna validación, ningún email ni el envío a Relevance AI se tocan.

## Restricciones respetadas

- No se modifica `Cart.tsx`, `Index.tsx`, ni ningún componente visual público.
- No se cambian RLS, migraciones SQL, tipos generados ni `config.toml`.
- No se añaden imports, exports ni dependencias.
- No se altera la lógica de validación ni el flujo de la edge function.

## Notas técnicas

- Tras desplegar, los pedidos nuevos creados vía `create-whatsapp-order` quedarán marcados con `order_source = 'web'`. Cualquier filtro/UI que distinga `'whatsapp'` (p. ej. `WaiterPanel.tsx:348` que muestra un badge si `order.order_source === 'whatsapp'`) dejará de marcar estos pedidos como WhatsApp. Esto es coherente con el cambio solicitado, pero es el único efecto colateral observable. Si quisieras conservar ese badge habría que tocar la lógica de UI; según las restricciones, no se hace.
- El despliegue de la edge function es automático tras el cambio.

## Criterios de aceptación

1. `WaiterPanel.tsx`: único `setInterval` que llama a `playLoudAlarm` con valor `30000`.
2. `create-whatsapp-order/index.ts`: `order_source: 'web'` en el `INSERT`.
3. Diff total: exactamente 2 líneas modificadas, 0 añadidas, 0 eliminadas.
