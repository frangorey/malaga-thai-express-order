import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Package, Clock, CheckCircle2, Truck, UtensilsCrossed, XCircle, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOrderRealtime } from "@/hooks/useOrderRealtime";
import { cn } from "@/lib/utils";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  customizations?: string[];
}

interface Order {
  id: string;
  order_number: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  order_type: string;
  items: OrderItem[];
  total_amount: number;
  delivery_fee: number | null;
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_STEPS = [
  { key: 'received', icon: Package, label: { es: 'Recibido', en: 'Received' } },
  { key: 'confirmed', icon: CheckCircle2, label: { es: 'Confirmado', en: 'Confirmed' } },
  { key: 'preparing', icon: UtensilsCrossed, label: { es: 'Preparando', en: 'Preparing' } },
  { key: 'ready', icon: Clock, label: { es: 'Listo', en: 'Ready' } },
  { key: 'delivered', icon: Truck, label: { es: 'Entregado', en: 'Delivered' } },
];

const getStatusIndex = (status: string) => {
  const index = STATUS_STEPS.findIndex(s => s.key === status);
  return index === -1 ? 0 : index;
};

const StatusTimeline = ({ currentStatus, language }: { currentStatus: string; language: 'es' | 'en' }) => {
  const currentIndex = getStatusIndex(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {STATUS_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = !isCancelled && index <= currentIndex;
          const isCurrent = !isCancelled && index === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-muted text-muted-foreground",
                  isCurrent && "ring-4 ring-primary/30 animate-pulse"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={cn(
                  "text-xs mt-2 text-center max-w-[60px]",
                  isCompleted ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {step.label[language]}
              </span>
            </div>
          );
        })}
      </div>
      {/* Progress line */}
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted -z-0">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: isCancelled ? '0%' : `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
        />
      </div>
      {isCancelled && (
        <div className="flex items-center justify-center mt-4 text-destructive">
          <XCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">{language === 'es' ? 'Pedido Cancelado' : 'Order Cancelled'}</span>
        </div>
      )}
    </div>
  );
};

const OrderCard = ({ order, language }: { order: Order; language: 'es' | 'en' }) => {
  const items = Array.isArray(order.items) ? order.items : [];
  const formattedDate = new Date(order.created_at).toLocaleString(language === 'es' ? 'es-ES' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const getPaymentBadge = () => {
    const isPaid = order.payment_status === 'paid';
    return (
      <Badge variant={isPaid ? "default" : "secondary"}>
        {isPaid
          ? (language === 'es' ? 'Pagado' : 'Paid')
          : (language === 'es' ? 'Pendiente' : 'Pending')}
      </Badge>
    );
  };

  const getOrderTypeBadge = () => {
    const isDelivery = order.order_type === 'delivery';
    return (
      <Badge variant="outline">
        {isDelivery
          ? (language === 'es' ? 'Domicilio' : 'Delivery')
          : (language === 'es' ? 'Recogida' : 'Pickup')}
      </Badge>
    );
  };

  return (
    <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-bold text-primary">
              #{order.order_number}
            </CardTitle>
            <div className="flex gap-2">
              {getPaymentBadge()}
              {getOrderTypeBadge()}
            </div>
          </div>
          <span className="text-sm text-muted-foreground">{formattedDate}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timeline */}
        <StatusTimeline currentStatus={order.order_status} language={language} />

        <Separator />

        {/* Items */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">
            {language === 'es' ? 'Productos' : 'Items'}
          </h4>
          <div className="space-y-1">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.name}
                  {item.customizations && item.customizations.length > 0 && (
                    <span className="text-muted-foreground text-xs ml-1">
                      ({item.customizations.join(', ')})
                    </span>
                  )}
                </span>
                <span className="font-medium">{(item.price * item.quantity).toFixed(2)}€</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery info */}
        {order.order_type === 'delivery' && order.delivery_address && (
          <>
            <Separator />
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{order.delivery_address}</span>
            </div>
          </>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
            <strong>{language === 'es' ? 'Notas:' : 'Notes:'}</strong> {order.notes}
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="font-medium">{language === 'es' ? 'Total' : 'Total'}</span>
          <span className="text-xl font-bold text-primary">
            {order.total_amount.toFixed(2)}€
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default function OrderHistory() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time updates
  useOrderRealtime(orders.length > 0 ? orders[0].order_number : null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data as unknown as Order[]);
      }
      setLoading(false);
    };

    fetchOrders();

    // Subscribe to real-time updates for user's orders
    const channel = supabase
      .channel('user-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === (payload.new as Order).id ? (payload.new as Order) : order
              )
            );
          } else if (payload.eventType === 'INSERT') {
            setOrders((prev) => [payload.new as Order, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const lang = language as 'es' | 'en';

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Package className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">
          {lang === 'es' ? 'Inicia sesión' : 'Sign in'}
        </h1>
        <p className="text-muted-foreground mb-4 text-center">
          {lang === 'es'
            ? 'Necesitas iniciar sesión para ver tu historial de pedidos'
            : 'You need to sign in to view your order history'}
        </p>
        <Link to="/">
          <Button variant="neon">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {lang === 'es' ? 'Volver al menú' : 'Back to menu'}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">
                {lang === 'es' ? 'Mis Pedidos' : 'My Orders'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {lang === 'es' ? 'Historial y seguimiento en tiempo real' : 'History and real-time tracking'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-32" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">
              {lang === 'es' ? 'Sin pedidos aún' : 'No orders yet'}
            </h2>
            <p className="text-muted-foreground mb-4 text-center">
              {lang === 'es'
                ? '¡Haz tu primer pedido y aparecerá aquí!'
                : 'Make your first order and it will appear here!'}
            </p>
            <Link to="/">
              <Button variant="neon">
                {lang === 'es' ? 'Ver menú' : 'View menu'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} language={lang} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
