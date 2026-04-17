import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, RefreshCw, ChefHat, PackageCheck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_type: string;
  order_status: string;
  total_amount: number;
  table_number: number | null;
  notes: string | null;
  items: any;
  created_at: string;
  confirmed_at: string | null;
}

interface TableDetailDrawerProps {
  tableNumber: number | null;
  orders: Order[];
  onClose: () => void;
  onConfirmOrder: (order: Order) => void;
  onMarkReady?: (order: Order) => void;
  onMarkDelivered?: (order: Order) => void;
  confirmingId: string | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  received:  { label: 'Recibido',   color: 'bg-blue-500' },
  confirmed: { label: 'Confirmado', color: 'bg-green-500' },
  preparing: { label: 'Preparando', color: 'bg-yellow-500' },
  ready:     { label: 'Listo',      color: 'bg-orange-500' },
  delivered: { label: 'Entregado',  color: 'bg-green-600' },
  cancelled: { label: 'Cancelado',  color: 'bg-red-500' },
};

const TableDetailDrawer = ({
  tableNumber,
  orders,
  onClose,
  onConfirmOrder,
  onMarkReady,
  onMarkDelivered,
  confirmingId,
}: TableDetailDrawerProps) => {
  const [history, setHistory] = useState<Order[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const isOpen = tableNumber !== null;
  const totalActive = orders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
  const hasReceived = orders.some(o => o.order_status === 'received' && !o.confirmed_at);

  useEffect(() => {
    if (tableNumber === null) {
      setHistory([]);
      return;
    }
    const fetchHistory = async () => {
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('table_number', tableNumber)
        .in('order_status', ['delivered', 'cancelled'])
        .order('created_at', { ascending: false })
        .limit(20);
      if (!error && data) setHistory(data as unknown as Order[]);
      setLoadingHistory(false);
    };
    fetchHistory();
  }, [tableNumber]);

  return (
    <Sheet open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-3 border-b border-border bg-gradient-to-br from-primary/10 to-transparent">
          <SheetTitle className="flex items-center justify-between gap-2">
            <span className="text-2xl">🍽️ Mesa {tableNumber}</span>
            <Badge
              className={
                hasReceived
                  ? 'bg-destructive text-destructive-foreground animate-pulse'
                  : orders.length > 0
                  ? 'bg-yellow-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }
            >
              {hasReceived ? 'Sin tramitar' : orders.length > 0 ? 'Activa' : 'Libre'}
            </Badge>
          </SheetTitle>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{orders.length} pedido(s) activo(s)</span>
            <span className="font-mono font-bold text-lg text-primary">{totalActive.toFixed(2)}€</span>
          </div>
        </SheetHeader>

        <div className="p-4">
          <Tabs defaultValue="active">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="active">Activos ({orders.length})</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>

            {/* ACTIVOS */}
            <TabsContent value="active" className="space-y-3 mt-4">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No hay pedidos activos</p>
                </div>
              ) : (
                orders.map(order => {
                  const statusInfo = STATUS_LABELS[order.order_status] || { label: order.order_status, color: 'bg-muted' };
                  const items = Array.isArray(order.items) ? order.items : [];
                  const isReceived = order.order_status === 'received' && !order.confirmed_at;
                  return (
                    <Card key={order.id} className={`border-2 ${isReceived ? 'border-destructive' : 'border-border'}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-mono">{order.order_number}</CardTitle>
                          <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          🕐 {format(new Date(order.created_at), 'HH:mm:ss', { locale: es })} · {order.customer_name}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-2">
                        <ul className="text-sm space-y-1 border-t border-border pt-2">
                          {items.map((item: any, i: number) => (
                            <li key={i} className="flex justify-between">
                              <span>{item.quantity}x {item.name}</span>
                              <span className="text-muted-foreground">{(item.price * item.quantity).toFixed(2)}€</span>
                            </li>
                          ))}
                        </ul>
                        {order.notes && (
                          <div className="bg-muted/50 rounded p-2 text-xs">
                            <span className="font-medium">📝 </span>{order.notes}
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-sm border-t border-border pt-2">
                          <span>Total</span>
                          <span>{Number(order.total_amount).toFixed(2)}€</span>
                        </div>
                        {isReceived && (
                          <Button
                            className="w-full"
                            variant="neon"
                            size="sm"
                            disabled={confirmingId === order.id}
                            onClick={() => onConfirmOrder(order)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {confirmingId === order.id ? 'Tramitando...' : 'Tramitar pedido'}
                          </Button>
                        )}
                        {order.order_status === 'confirmed' && onMarkReady && (
                          <Button
                            className="w-full border-green-500 text-green-500 hover:bg-green-500/10"
                            variant="outline"
                            size="sm"
                            disabled={confirmingId === order.id}
                            onClick={() => onMarkReady(order)}
                          >
                            <ChefHat className="w-4 h-4 mr-2" />
                            {confirmingId === order.id ? 'Actualizando...' : '🍽️ Comida sale'}
                          </Button>
                        )}
                        {order.order_status === 'ready' && onMarkDelivered && (
                          <Button
                            className="w-full"
                            variant="default"
                            size="sm"
                            disabled={confirmingId === order.id}
                            onClick={() => onMarkDelivered(order)}
                          >
                            <PackageCheck className="w-4 h-4 mr-2" />
                            {confirmingId === order.id ? 'Actualizando...' : '✅ Entregado'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* HISTORIAL */}
            <TabsContent value="history" className="space-y-2 mt-4">
              {loadingHistory ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Sin historial reciente
                </div>
              ) : (
                history.map(o => {
                  const statusInfo = STATUS_LABELS[o.order_status] || { label: o.order_status, color: 'bg-muted' };
                  return (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                      <div className="min-w-0">
                        <div className="font-mono text-sm font-semibold truncate">{o.order_number}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(o.created_at), "d MMM · HH:mm", { locale: es })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-sm">{Number(o.total_amount).toFixed(2)}€</span>
                        <Badge className={`${statusInfo.color} text-white text-xs`}>{statusInfo.label}</Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TableDetailDrawer;
