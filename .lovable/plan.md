

## Plan: Comandero Visual por Mesas

### Archivos nuevos (4)

**1. `src/components/waiter/TableCard.tsx`** — Tarjeta 130×130px
- Props: `tableNumber, status, ordersCount, total, latestTime, pendingCount, onClick`
- Bordes y sombras según estado (free/received/confirmed/preparing/ready)
- `received` añade `animate-pulse` + sombra roja neón
- Número grande con `neon-text`, emoji estado, total €, hora, badge rojo si pendingCount > 0
- `hover:scale-105` + `cursor-pointer`

**2. `src/components/waiter/FloorPlanView.tsx`** — Plano agrupado
- `useMemo` agrupa orders donde `order_type === 'dine_in'` por `table_number`
- Estado peor gana: `received > confirmed > preparing > ready > free`
- Suma total acumulado y cuenta `pendingCount` (received sin confirmar)
- Sección Salón (1–5, grid 5 cols) + Terraza (6–14, grid responsive)
- Leyenda de colores abajo

**3. `src/components/waiter/TableDetailDrawer.tsx`** — Drawer lateral
- Shadcn `Sheet side="right"`, `max-w-lg`
- Header con número mesa + total € + badge estado
- Tabs: **Activos** (cards estilo WaiterPanel + botón Tramitar para `received`) y **Historial** (query a Supabase: delivered/cancelled últimos 20)
- Query historial dentro de `useEffect([tableNumber])` solo cuando drawer abierto

**4. `src/components/admin/TableQRCodes.tsx`** — Gestor QR (admin)
- `qrcode.react` (nueva dependencia)
- Grid 14 QRs (2 col móvil / 4 col desktop), cada uno apuntando a `https://www.thaiiexpress.es/?mesa=N`
- Botón descarga PNG individual (canvas serialization)
- Botón "Imprimir todos" con CSS `@media print` (A6, 2 cols)
- Integración: nueva pestaña en `AdminPanel.tsx` con icono `QrCode`

### Archivo modificado (1)

**5. `src/pages/WaiterPanel.tsx`**
- Añadir estado `viewMode: 'list' | 'floor'` (default `'floor'`) y `selectedTable: number | null`
- Toggle de vista (botones 🗺️ Plano / 📋 Lista) tras el header, antes de filtros
- Render condicional: `FloorPlanView` o el grid actual de cards (sin tocarlo)
- Montar `TableDetailDrawer` al final, alimentado con orders filtradas por `selectedTable`
- **No tocar**: `fetchOrders`, `playLoudAlarm`, `handleConfirmOrder`, canal realtime, alarma, lógica de roles

### i18n (LanguageContext)

Nuevas claves × 5 idiomas: `floor_plan, list_view, salon, terraza, table_free, table_busy, table_ready, view_history, active_orders, history, qr_codes_tab, print_qrs, scan_to_order, download_qr`

### Dependencia nueva

```
qrcode.react  (~6KB gzip)
```

### Diff resumen (archivos tocados)

```text
NEW  src/components/waiter/TableCard.tsx              ~70 líneas
NEW  src/components/waiter/FloorPlanView.tsx          ~110 líneas
NEW  src/components/waiter/TableDetailDrawer.tsx      ~140 líneas
NEW  src/components/admin/TableQRCodes.tsx            ~120 líneas
MOD  src/pages/WaiterPanel.tsx                        +25 líneas (toggle + drawer mount)
MOD  src/pages/AdminPanel.tsx                         +1 tab (QrCode + TableQRCodes)
MOD  src/contexts/LanguageContext.tsx                 +14 keys × 5 langs
MOD  package.json                                     +qrcode.react
```

### Garantías

- Realtime existente (`waiter-orders`) reutilizado — cualquier cambio refresca el plano automáticamente
- Lista actual sigue intacta y accesible vía toggle
- `handleConfirmOrder` se pasa al drawer sin modificar (misma firma)
- Solo lee/escribe `orders` con políticas RLS ya existentes para `moderator`
- Sin cambios de schema ni migraciones

