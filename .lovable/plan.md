## Bloque 2 — Integrar WaiterDashboard como vista por defecto en WaiterPanel

Único archivo: `src/pages/WaiterPanel.tsx`. Anclas verificadas: import de `TableDetailDrawer` línea 15, imports lucide línea 10, `viewMode` línea 156, toggle líneas 420–438, filter tabs línea 440–441, render floor línea 462, render list línea 470.

### Ediciones

1. **Línea 15** — Añadir tras el import de `TableDetailDrawer`:
   `import WaiterDashboard from '@/components/waiter/WaiterDashboard';`

2. **Línea 10** — Añadir `LayoutDashboard` al final de los imports de `lucide-react`.

3. **Línea 156** — Reemplazar:
   `const [viewMode, setViewMode] = useState<'list' | 'floor'>('floor');`
   por:
   `const [currentView, setCurrentView] = useState<'dashboard' | 'list' | 'floor'>('dashboard');`

4. **Renombrar todas las ocurrencias** de `viewMode` → `currentView` y `setViewMode` → `setCurrentView` (líneas 423, 425, 431, 433, 441, 462, 470). Solo 6 referencias confirmadas vía rg.

5. **Líneas 420–438** — Sustituir el toggle de 2 botones (Plano/Lista con emojis) por 3 botones en orden Panel → Lista → Plano, con `LayoutDashboard`/`List`/`Map` y labels `t('nav_dashboard')`, `t('nav_list')`, `t('nav_floor')`.

6. **Antes de la línea 440** (`{/* Filter tabs (only in list view) */}`) — Insertar render condicional:
   ```tsx
   {currentView === 'dashboard' && !isLoading && (
     <WaiterDashboard
       orders={orders as any}
       onNavigate={(view) => setCurrentView(view)}
       calculatePriority={calculatePriority}
     />
   )}
   ```

### No se toca

`calculatePriority`, `fetchOrders`, useEffects (realtime, polling 8s, alarma), `playLoudAlarm`, handlers (`handleConfirmOrder`, `handleMarkReady`, `handleMarkDelivered`, `handleCancelOrder`), Dialog de cancelación, `TableDetailDrawer`, filter tabs, interfaz `Order`, render de `filteredOrders`. Sin localStorage. Sin otros archivos modificados.
