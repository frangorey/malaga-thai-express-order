import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, RefreshCw, Store, UtensilsCrossed, Clock, CheckCircle, MessageCircle, Globe, Map, List, ChefHat, PackageCheck, AlertTriangle, StickyNote, HelpCircle, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import FloorPlanView from '@/components/waiter/FloorPlanView';
import TableDetailDrawer from '@/components/waiter/TableDetailDrawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

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

const formatElapsed = (createdAt: string): string => {
  const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return `${mins}m ${String(secs).padStart(2, '0')}s`;
};

const CRITICAL_WORDS = [
  'alergia', 'alérgico', 'alergica', 'alergias',
  'sin gluten', 'celíaco', 'celiaco', 'celiac',
  'intoler', 'vegano', 'vegetariano',
  'embarazo', 'embarazada', 'picante'
];

const hasCriticalNote = (notes: string | null): boolean => {
  if (!notes) return false;
  const lower = notes.toLowerCase();
  return CRITICAL_WORDS.some(w => lower.includes(w));
};

const CATEGORY_ETA_MINUTES: Record<string, number> = {
  'Tallarines': 15, 'Arroces': 15, 'Ensaladas': 10, 'Entrantes': 10,
  'Otras del Mundo': 15, 'Sopas': 15, 'Pokes': 10, 'Bebidas': 2, 'Postres': 5,
};

const calculateOrderETA = (items: any[]): number => {
  if (!items || items.length === 0) return 20;
  const maxETA = Math.max(...items.map(item => CATEGORY_ETA_MINUTES[item.category as string] ?? 15));
  return maxETA + 5 + (items.length >= 8 ? 5 : 0);
};

const calculatePriority = (order: {
  order_status: string; order_type: string; created_at: string; items: any;
}): number => {
  const items = Array.isArray(order.items) ? order.items : [];
  const elapsedMin = (Date.now() - new Date(order.created_at).getTime()) / 60000;
  const { order_status: status, order_type: type } = order;
  if (status === 'received') {
    if (elapsedMin < 2)  return 0;
    if (elapsedMin < 5)  return 1;
    if (elapsedMin < 10) return 2;
    return 3;
  }
  if (status === 'confirmed' || status === 'preparing') {
    const eta = calculateOrderETA(items);
    const over = elapsedMin - eta;
    if (over <= 0) return 0;
    if (over <= 5) return 1;
    return 3;
  }
  if (status === 'ready') {
    const eta = calculateOrderETA(items);
    const timeInReady = Math.max(0, elapsedMin - eta);
    if (type === 'dine_in') {
      if (timeInReady < 3) return 0;
      if (timeInReady < 5) return 1;
      return 3;
    } else {
      if (timeInReady < 3)  return 0;
      if (timeInReady < 10) return 1;
      return 3;
    }
  }
  return 0;
};

const getPriorityClassName = (priority: number): string => {
  switch (priority) {
    case 1:  return 'border-yellow-400';
    case 2:  return 'border-orange-400';
    case 3:  return 'border-red-500 animate-pulse';
    default: return 'border-green-300';
  }
};

const getPriorityMessageKey = (
  order: { order_status: string; order_type: string },
  priority: number
): string | null => {
  const { order_status: status } = order;
  if (status === 'received') {
    return ['priority_received_normal','priority_received_attention',
            'priority_received_urgent','priority_received_critical'][priority] ?? null;
  }
  if (status === 'confirmed' || status === 'preparing') {
    if (priority === 0) return 'priority_kitchen_on_time';
    if (priority === 1) return 'priority_kitchen_delayed';
    if (priority === 3) return 'priority_kitchen_critical';
    return null;
  }
  if (status === 'ready') {
    if (priority === 0) return 'priority_ready_recent';
    if (priority === 1) return 'priority_ready_waiting';
    if (priority === 3) return 'priority_ready_too_long';
    return null;
  }
  return null;
};

const WaiterPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isModerator, isLoading: roleLoading } = useUserRole();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'dine_in' | 'pickup' | 'delivery'>('all');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'floor'>('floor');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTargetOrder, setCancelTargetOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelOtherText, setCancelOtherText] = useState('');
  const [tick, setTick] = useState(0);
  const orderCountRef = useRef(0);
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check if there are unconfirmed orders (received status, no confirmed_at)
  const hasUnconfirmedOrders = orders.some(o => o.order_status === 'received');

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
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

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
      }, 30000);
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

  const handleMarkReady = async (order: Order) => {
    setConfirmingId(order.id);
    const { error } = await supabase
      .from('orders')
      .update({ order_status: 'ready' })
      .eq('id', order.id);
    if (error) {
      console.error('Error marking ready:', error);
      toast.error('Error al actualizar el pedido');
    } else {
      toast.success(`Mesa ${order.table_number ?? '?'} — Comida en camino ✅`);
      fetchOrders();
    }
    setConfirmingId(null);
  };

  const handleMarkDelivered = async (order: Order) => {
    setConfirmingId(order.id);
    const { error } = await supabase
      .from('orders')
      .update({ order_status: 'delivered' })
      .eq('id', order.id);
    if (error) {
      console.error('Error marking delivered:', error);
      toast.error('Error al actualizar el pedido');
    } else {
      toast.success('Pedido entregado');
      fetchOrders();
    }
    setConfirmingId(null);
  };

  const handleCancelOrder = async () => {
    if (!cancelTargetOrder || !cancelReason) return;
    const motivo = cancelReason === 'other' ? cancelOtherText.trim() : cancelReason;
    if (!motivo) return;
    const notasActuales = cancelTargetOrder.notes || '';
    const notasNuevas = notasActuales
      ? `${notasActuales} [CANCELADO: ${motivo}]`
      : `[CANCELADO: ${motivo}]`;
    setConfirmingId(cancelTargetOrder.id);
    const { error } = await supabase
      .from('orders')
      .update({ order_status: 'cancelled', notes: notasNuevas })
      .eq('id', cancelTargetOrder.id);
    if (error) {
      toast.error('Error al cancelar el pedido');
    } else {
      toast.success(t('order_cancelled_toast'));
      fetchOrders();
    }
    setConfirmingId(null);
    setShowCancelModal(false);
    setCancelTargetOrder(null);
    setCancelReason('');
    setCancelOtherText('');
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

  const filteredOrders = (
    filter === 'all' ? orders : orders.filter(o => o.order_type === filter)
  ).slice().sort((a, b) => {
    const pa = calculatePriority(a);
    const pb = calculatePriority(b);
    if (pb !== pa) return pb - pa;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

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
                <Card key={order.id} className={`border-2 transition-colors ${getPriorityClassName(calculatePriority(order))}`}>
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
                        <span className="ml-2 text-xs font-mono text-muted-foreground/70">
                          (hace {formatElapsed(order.created_at)})
                        </span>
                        {(() => {
                          const _p = calculatePriority(order);
                          const _mk = getPriorityMessageKey(order, _p);
                          if (_p < 1 || !_mk) return null;
                          const colorMap: Record<number, string> = {
                            1: 'text-yellow-600',
                            2: 'text-orange-500',
                            3: 'text-red-600 font-bold',
                          };
                          return (
                            <span className={`ml-2 text-xs ${colorMap[_p] ?? ''}`}>
                              · {t(_mk)}
                            </span>
                          );
                        })()}
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
                      hasCriticalNote(order.notes) ? (
                        <div className="bg-red-50 border border-red-200 rounded p-2 text-sm">
                          <p className="font-bold text-red-700">
                            🚨 ⚠️ {order.notes}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded p-2 text-sm">
                          <p className="font-bold text-amber-800">
                            ⚠️ 📝 {order.notes}
                          </p>
                        </div>
                      )
                    )}

                    {/* Total */}
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>{order.total_amount.toFixed(2)}€</span>
                    </div>

                    {/* Action buttons by status */}
                    {isReceived && (
                      <div className="mt-3 space-y-3">
                        <div className="bg-orange-50 border border-orange-300 rounded-lg p-3">
                          <p className="font-bold text-orange-800 text-sm mb-2">
                            {t('new_order_action_title')}
                          </p>
                          <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
                            <li>{t('new_order_step_1')}</li>
                            <li>{t('new_order_step_2')}</li>
                            <li>{t('new_order_step_3')}</li>
                            <li>{t('new_order_step_4')}</li>
                          </ol>
                        </div>
                        <Button
                          className="w-full"
                          variant="neon"
                          size="lg"
                          disabled={confirmingId === order.id}
                          onClick={() => handleConfirmOrder(order)}
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          {confirmingId === order.id ? 'Tramitando...' : t('confirm_in_kitchen_button')}
                        </Button>
                      </div>
                    )}
                    {order.order_status === 'confirmed' && (
                      <Button
                        className="w-full mt-2 border-green-500 text-green-500 hover:bg-green-500/10"
                        variant="outline"
                        size="lg"
                        disabled={confirmingId === order.id}
                        onClick={() => handleMarkReady(order)}
                      >
                        <ChefHat className="w-5 h-5 mr-2" />
                        {confirmingId === order.id ? 'Actualizando...' : '🍽️ Comida sale'}
                      </Button>
                    )}
                    {order.order_status === 'ready' && (
                      <Button
                        className="w-full mt-2"
                        variant="default"
                        size="lg"
                        disabled={confirmingId === order.id}
                        onClick={() => handleMarkDelivered(order)}
                      >
                        <PackageCheck className="w-5 h-5 mr-2" />
                        {confirmingId === order.id ? 'Actualizando...' : '✅ Entregado'}
                      </Button>
                    )}
                    {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full mt-2 border-destructive text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setCancelTargetOrder(order);
                          setCancelReason('');
                          setCancelOtherText('');
                          setShowCancelModal(true);
                        }}
                      >
                        {t('cancel_order_button')}
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
        onMarkReady={handleMarkReady}
        onMarkDelivered={handleMarkDelivered}
        confirmingId={confirmingId}
      />

      {/* Cancel order dialog */}
      <Dialog
        open={showCancelModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowCancelModal(false);
            setCancelTargetOrder(null);
            setCancelReason('');
            setCancelOtherText('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cancel_order_dialog_title')}</DialogTitle>
            <DialogDescription>{t('cancel_order_dialog_description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>{t('cancel_reason_select_label')}</Label>
            <Select value={cancelReason} onValueChange={setCancelReason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[9999]" sideOffset={4}>
                <SelectItem value="product_unavailable">{t('cancel_reason_product_unavailable')}</SelectItem>
                <SelectItem value="customer_no_show">{t('cancel_reason_customer_no_show')}</SelectItem>
                <SelectItem value="order_error">{t('cancel_reason_order_error')}</SelectItem>
                <SelectItem value="other">{t('cancel_reason_other')}</SelectItem>
              </SelectContent>
            </Select>
            {cancelReason === 'other' && (
              <Textarea
                value={cancelOtherText}
                onChange={(e) => setCancelOtherText(e.target.value)}
                placeholder={t('cancel_reason_other_placeholder')}
                rows={2}
              />
            )}
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button
              variant="destructive"
              className="w-full"
              disabled={
                !cancelReason ||
                (cancelReason === 'other' && !cancelOtherText.trim()) ||
                confirmingId === cancelTargetOrder?.id
              }
              onClick={handleCancelOrder}
            >
              {confirmingId === cancelTargetOrder?.id ? 'Cancelando...' : t('confirm_cancel_button')}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowCancelModal(false);
                setCancelTargetOrder(null);
                setCancelReason('');
                setCancelOtherText('');
              }}
            >
              {t('back_button')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaiterPanel;
