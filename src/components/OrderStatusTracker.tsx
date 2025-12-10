import { useActiveOrdersRealtime } from '@/hooks/useOrderRealtime';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

const ORDER_STATUS_LABELS: Record<string, string> = {
  received: 'Recibido',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  ready: 'Listo',
  out_for_delivery: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  received: 'bg-blue-500',
  confirmed: 'bg-green-500',
  preparing: 'bg-yellow-500',
  ready: 'bg-orange-500',
  out_for_delivery: 'bg-purple-500',
  delivered: 'bg-green-600',
  cancelled: 'bg-red-500',
};

export function OrderStatusTracker() {
  const { activeOrders } = useActiveOrdersRealtime();

  // Filter out delivered/cancelled orders from display
  const pendingOrders = activeOrders.filter(
    (order) => !['delivered', 'cancelled'].includes(order.order_status)
  );

  if (pendingOrders.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-4 w-4 text-primary animate-pulse" />
          <span className="font-semibold text-sm">Pedidos activos</span>
        </div>
        <div className="space-y-2">
          {pendingOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="text-muted-foreground font-mono text-xs">
                {order.order_number}
              </span>
              <Badge
                className={`${STATUS_COLORS[order.order_status]} text-white text-xs`}
              >
                {ORDER_STATUS_LABELS[order.order_status] || order.order_status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
