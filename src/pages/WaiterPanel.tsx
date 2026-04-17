import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, RefreshCw, Store, UtensilsCrossed, Clock, CheckCircle, MessageCircle, Globe, Map, List } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import FloorPlanView from '@/components/waiter/FloorPlanView';
import TableDetailDrawer from '@/components/waiter/TableDetailDrawer';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_type: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  table_number: number | null;
  notes: string | null;
  items: any;
  created_at: string;
  confirmed_at: string | null;
  order_source: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  received: { label: 'Recibido', color: 'bg-blue-500' },
  confirmed: { label: 'Confirmado', color: 'bg-green-500' },
  preparing: { label: 'Preparando', color: 'bg-yellow-500' },
  ready: { label: 'Listo', color: 'bg-orange-500' },
  delivered: { label: 'Entregado', color: 'bg-green-600' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500' },
};

const WaiterPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isModerator, isLoading: roleLoading } = useUserRole();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'dine_in' | 'pickup' | 'delivery'>('all');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'floor'>('floor');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const orderCountRef = useRef(0);
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check if there are unconfirmed orders (received status, no confirmed_at)
  const hasUnconfirmedOrders = orders.some(o => o.order_status === 'received' && !o.confirmed_at);

  useEffect(() => {
    if (!roleLoading && !user) {
      navigate('/');
      return;
    }
    if (!roleLoading && user && !isModerator) {
      toast.error('No tienes permisos para acceder a esta página');
      navigate('/');
    }
  }, [user, isModerator, roleLoading, navigate]);

  // Repeating loud alarm while there are unconfirmed orders
  useEffect(() => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }

    if (hasUnconfirmedOrders) {
      playLoudAlarm();
      alarmIntervalRef.current = setInterval(() => {
        playLoudAlarm();
      }, 12000);
    }

    return () => {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    };
  }, [hasUnconfirmedOrders]);

  useEffect(() => {
    if (isModerator) {
      fetchOrders();

      // Realtime (principal)
      const channel = supabase
        .channel('waiter-orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('Realtime evento:', payload);
            fetchOrders();
          }
        )
        .subscribe((status) => {
          console.log('Realtime status:', status);
        });

      // Polling de respaldo cada 8 segundos
      // Por si el WebSocket cae en tablet/móvil
      const pollInterval = setInterval(() => {
        fetchOrders();
      }, 8000);

      return () => {
        supabase.removeChannel(channel);
        clearInterval(pollInterval);
      };
    }
  }, [isModerator]);

  const playLoudAlarm = () => {
    try {
      const audioCtx = new AudioContext();
      const now = audioCtx.currentTime;

      for (let i = 0; i < 3; i++) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = i % 2 === 0 ? 1200 : 900;
        osc.type = 'square';
        const start = now + i * 0.25;
        gain.gain.setValueAtTime(0.8, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.2);
        osc.start(start);
        osc.stop(start + 0.2);
      }
    } catch (e) {
      console.log('Sound not available');
    }
  };

  const handleConfirmOrder = async (order: Order) => {
    setConfirmingId(order.id);
    const confirmedAt = new Date().toISOString();

    const { error } = await supabase
      .from('orders')
      .update({
        order_status: 'confirmed',
        confirmed_at: confirmedAt,
      })
      .eq('id', order.id);

    if (error) {
      console.error('Error confirming order:', error);
      toast.error('Error al confirmar el pedido');
    } else {
      toast.success(`Pedido ${order.order_number} tramitado ✅`);
      fetchOrders();
    }
    setConfirmingId(null);
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('order_status', ['received', 'confirmed', 'preparing', 'ready'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar los pedidos');
    } else {
      const newOrders = (data || []) as unknown as Order[];
      if (newOrders.length > orderCountRef.current && orderCountRef.current > 0) {
        toast.success('¡Nuevo pedido recibido!');
      }
      orderCountRef.current = newOrders.length;
      setOrders(newOrders);
    }
    setIsLoading(false);
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.order_type === filter);

  const getOrderTypeInfo = (order: Order) => {
    if (order.order_type === 'dine_in') {
      return {
        icon: <UtensilsCrossed className="w-4 h-4" />,
        label: `Mesa ${order.table_number || '?'}`,
        className: 'bg-primary text-primary-foreground',
      };
    }
    if (order.order_type === 'delivery') {
      return {
        icon: <Store className="w-4 h-4" />,
        label: 'Domicilio',
        className: 'bg-purple-600 text-white',
      };
    }
    return {
      icon: <Store className="w-4 h-4" />,
      label: 'Recoger',
      className: 'bg-secondary text-secondary-foreground',
    };
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isModerator) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground flex-1">Panel Camarero</h1>
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* View toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={viewMode === 'floor' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('floor')}
          >
            <Map className="w-4 h-4 mr-2" />
            🗺️ Plano
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4 mr-2" />
            📋 Lista
          </Button>
        </div>

        {/* Filter tabs (only in list view) */}
        {viewMode === 'list' && (
          <div className="flex gap-2 mb-6">
            {[
              { key: 'all' as const, label: 'Todos', count: orders.length },
              { key: 'dine_in' as const, label: '🍽️ Mesa', count: orders.filter(o => o.order_type === 'dine_in').length },
              { key: 'pickup' as const, label: '🏪 Recoger', count: orders.filter(o => o.order_type === 'pickup').length },
              { key: 'delivery' as const, label: '🚚 Domicilio', count: orders.filter(o => o.order_type === 'delivery').length },
            ].map(tab => (
              <Button
                key={tab.key}
                variant={filter === tab.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(tab.key)}
              >
                {tab.label} ({tab.count})
              </Button>
            ))}
          </div>
        )}

        {/* Floor plan view */}
        {viewMode === 'floor' && !isLoading && (
          <FloorPlanView
            orders={orders}
            onSelectTable={(n) => setSelectedTable(n)}
          />
        )}

        {/* Orders grid (list view) */}
        {viewMode === 'list' && (
        <>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No hay pedidos activos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map(order => {
              const typeInfo = getOrderTypeInfo(order);
              const statusInfo = STATUS_LABELS[order.order_status] || { label: order.order_status, color: 'bg-muted' };
              const items = Array.isArray(order.items) ? order.items : [];
              const isReceived = order.order_status === 'received' && !order.confirmed_at;

              return (
                <Card key={order.id} className={`border-2 transition-colors ${isReceived ? 'border-destructive animate-pulse' : 'hover:border-primary/50'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-mono">{order.order_number}</CardTitle>
                      <div className="flex items-center gap-1">
                        {order.order_source === 'whatsapp' ? (
                          <Badge className="bg-green-600 text-white flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-600 text-white flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            Web
                          </Badge>
                        )}
                        <Badge className={`${typeInfo.className} flex items-center gap-1`}>
                          {typeInfo.icon}
                          {typeInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        🕐 Pedido: {format(new Date(order.created_at), 'HH:mm:ss', { locale: es })}
                      </span>
                      <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
                    </div>
                    {order.confirmed_at && (
                      <div className="text-sm text-green-600 font-medium">
                        ✅ Tramitado: {format(new Date(order.confirmed_at), 'HH:mm:ss', { locale: es })}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {/* Customer */}
                    <div className="text-sm">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-muted-foreground">{order.customer_phone}</p>
                    </div>

                    {/* Items */}
                    <div className="border-t pt-2">
                      <ul className="text-sm space-y-1">
                        {items.map((item: any, i: number) => (
                          <li key={i} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="text-muted-foreground">{(item.price * item.quantity).toFixed(2)}€</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="bg-muted/50 rounded p-2 text-sm">
                        <span className="font-medium">📝 </span>{order.notes}
                      </div>
                    )}

                    {/* Total */}
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>{order.total_amount.toFixed(2)}€</span>
                    </div>

                    {/* Confirm button - only for unconfirmed orders */}
                    {isReceived && (
                      <Button
                        className="w-full mt-2"
                        variant="neon"
                        size="lg"
                        disabled={confirmingId === order.id}
                        onClick={() => handleConfirmOrder(order)}
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {confirmingId === order.id ? 'Tramitando...' : 'Pedido Tramitado'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        </>
        )}
      </div>

      {/* Table detail drawer */}
      <TableDetailDrawer
        tableNumber={selectedTable}
        orders={orders.filter(o => o.order_type === 'dine_in' && o.table_number === selectedTable)}
        onClose={() => setSelectedTable(null)}
        onConfirmOrder={handleConfirmOrder}
        confirmingId={confirmingId}
      />
    </div>
  );
};

export default WaiterPanel;
