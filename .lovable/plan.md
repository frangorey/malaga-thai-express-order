
Objetivo: eliminar definitivamente el error “Invalid table number” cuando el pedido llega desde Relevance/WhatsApp (mesa 3 y cualquier otra), haciendo el endpoint tolerante a los formatos reales que envía el agente.

1) Diagnóstico (con lo que ya se ve en logs/captura)
- El edge function sigue devolviendo `Validation failed: Invalid table number`.
- En tu screenshot de Relevance, el flujo usa campos “humanos”/snake_case (`table_number`, `order_type`, etc.), mientras que el backend valida en camelCase y estructura anidada (`orderType`, `customerInfo.phonePrefix`, `tableNumber`).
- El parche anterior (parseInt) arregla solo un caso (string numérico en `tableNumber`), pero no cubre diferencias de nombre de campos ni formatos mixtos que Relevance puede mandar.

2) Causa raíz más probable
- El backend está leyendo `req.tableNumber` pero Relevance probablemente está enviando `table_number` (o un valor no normalizado).
- Resultado: para `dine_in`, el valor leído para mesa queda vacío/no numérico y cae en “Invalid table number”.

3) Plan de implementación (sin romper lo que ya funciona en web)
A. Normalizar payload al inicio del edge function (antes de validar)
- Crear una capa de “input normalization” que acepte ambos formatos:
  - Top-level: `orderType` o `order_type`
  - Mesa: `tableNumber` o `table_number`
  - Fee: `deliveryFee` o `delivery_fee`
  - Cliente:
    - formato anidado `customerInfo`
    - o formato plano de Relevance (`customer_name`, `phone_prefix`, `phone`, `address`, `email`, `notes`)
- Mantener compatibilidad total con frontend actual (que ya envía camelCase + `customerInfo`).

B. Validación robusta de mesa
- Implementar parser estricto:
  - Aceptar `number` entero o `string` limpia de dígitos.
  - Rechazar valores ambiguos (`"3abc"`, `"mesa 3"`, `""`, `null`).
  - Rango permitido: 1..14.
- Guardar siempre `tableNumber` ya normalizado como `number`.

C. Validación de items y tipos (hardening rápido)
- Si `items` llega como string JSON (común en tool-calls), intentar `JSON.parse` seguro.
- Verificar `quantity/price/id` numéricos válidos para evitar pedidos corruptos.
- Mantener sanitización de strings como ya está.

D. Logs de diagnóstico útiles (sin datos sensibles)
- Añadir log estructurado cuando falle validación, incluyendo solo:
  - keys presentes (`Object.keys(payload)`),
  - `orderType/order_type`,
  - `tableNumber/table_number` raw,
  - tipo de dato (`typeof`),
  - motivo concreto de rechazo.
- Esto evita volver a “adivinar” desde Relevance.

E. Deploy y verificación
- Desplegar `create-whatsapp-order`.
- Probar 4 escenarios:
  1) dine_in mesa 3 con `table_number` (Relevance)
  2) dine_in mesa 3 con `tableNumber` (frontend/camel)
  3) delivery sin mesa
  4) pickup sin mesa
- Confirmar en WaiterPanel:
  - entra en estado `received`,
  - suena/alerta,
  - badge origen `whatsapp`,
  - botón “Tramitar pedido” operativo.

4) Archivos a tocar
- `supabase/functions/create-whatsapp-order/index.ts`
  - añadir función de normalización + parser estricto de mesa
  - ajustar validación para usar payload normalizado
  - mejorar logs de validación

5) Criterio de éxito
- Pedidos WhatsApp para mesa 3 (y 1–14) se crean sin error.
- No se rompe el flujo web actual.
- Si vuelve a fallar, el log ya muestra exactamente qué formato llegó y por qué se rechazó.

6) Detalles técnicos (sección dedicada)
```text
Propuesta de contrato de entrada compatible (aceptar ambos):
- orderType | order_type: "pickup" | "delivery" | "dine_in"
- tableNumber | table_number: number | string (solo dígitos)
- deliveryFee | delivery_fee: number|string
- customerInfo: {
    name, phonePrefix, phone, address?, email?, notes?
  }
  o plano:
  customer_name, phone_prefix, phone, address, email, notes
- items: CartItem[] | string(JSON)

Parser mesa recomendado:
- if number => Number.isInteger(v)
- if string => trim + regex /^[0-9]{1,2}$/ + Number(v)
- reject NaN, decimals, texto mixto
- enforce 1 <= mesa <= 14
```

7) Riesgos y mitigación
- Riesgo: aceptar demasiadas variantes puede ocultar errores del agente.
- Mitigación: normalizar + validar estricto + logs explícitos + respuesta 400 con motivo claro.

8) Orden de ejecución recomendado
1. Refactor de normalización/validación en edge function.
2. Deploy de la función.
3. Test end-to-end desde Relevance con mesa 3.
4. Verificación UI (alerta sonora/visual + botón tramitar + badge WhatsApp).
