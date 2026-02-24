import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, RefreshCw, Store, UtensilsCrossed, Clock, Volume2, VolumeX } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState<'all' | 'dine_in' | 'pickup'>('all');
  const orderCountRef = useRef(0);

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

  useEffect(() => {
    if (isModerator) {
      fetchOrders();

      const channel = supabase
        .channel('waiter-orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            if (payload.eventType === 'INSERT' && soundEnabled) {
              playNotificationSound();
            }
            fetchOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isModerator, soundEnabled]);

  const playNotificationSound = () => {
    try {
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log('Sound not available');
    }
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
      const newOrders = data || [];
      if (newOrders.length > orderCountRef.current && orderCountRef.current > 0 && soundEnabled) {
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
        variant: 'default' as const,
        className: 'bg-primary text-primary-foreground',
      };
    }
    return {
      icon: <Store className="w-4 h-4" />,
      label: 'Recoger',
      variant: 'secondary' as const,
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Silenciar notificaciones' : 'Activar notificaciones'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all' as const, label: 'Todos', count: orders.length },
            { key: 'dine_in' as const, label: '🍽️ Mesa', count: orders.filter(o => o.order_type === 'dine_in').length },
            { key: 'pickup' as const, label: '🏪 Recoger', count: orders.filter(o => o.order_type === 'pickup').length },
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

        {/* Orders grid */}
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

              return (
                <Card key={order.id} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-mono">{order.order_number}</CardTitle>
                      <Badge className={`${typeInfo.className} flex items-center gap-1`}>
                        {typeInfo.icon}
                        {typeInfo.label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {format(new Date(order.created_at), 'HH:mm', { locale: es })}
                      </span>
                      <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
                    </div>
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WaiterPanel;
