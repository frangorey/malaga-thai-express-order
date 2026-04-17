import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, CreditCard, CheckCircle2, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  order_status: string;
  total_amount: number;
  items: any;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  received:  { label: 'Recibido',   color: 'bg-blue-500' },
  confirmed: { label: 'Confirmado', color: 'bg-green-500' },
  preparing: { label: 'Preparando', color: 'bg-yellow-500' },
  ready:     { label: 'Listo',      color: 'bg-orange-500' },
};

const ACTIVE_STATUSES = ['received', 'confirmed', 'preparing', 'ready'];

const MesaPanel = () => {
  const { tableNumber } = useParams<{ tableNumber: string }>();
  const tableNum = Number(tableNumber);
  const [orders, setOrders] = useState<Order[]>([]);
  const [billRequested, setBillRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const fetchOrders = async () => {
    if (!Number.isFinite(tableNum)) return;
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, order_status, total_amount, items, created_at')
      .eq('table_number', tableNum)
      .in('order_status', ACTIVE_STATUSES)
      .order('created_at', { ascending: false });
    if (!error) setOrders((data || []) as unknown as Order[]);
    setIsLoading(false);
  };

  const fetchBillStatus = async () => {
    if (!Number.isFinite(tableNum)) return;
    const { data } = await supabase
      .from('table_layout')
      .select('bill_requested')
      .eq('table_number', tableNum)
      .maybeSingle();
    setBillRequested(!!data?.bill_requested);
  };

  useEffect(() => {
    fetchOrders();
    fetchBillStatus();

    const ordersChannel = supabase
      .channel(`mesa-${tableNum}-orders`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `table_number=eq.${tableNum}` },
        () => fetchOrders()
      )
      .subscribe();

    const billChannel = supabase
      .channel(`mesa-${tableNum}-bill`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'table_layout', filter: `table_number=eq.${tableNum}` },
        () => fetchBillStatus()
      )
      .subscribe();

    const poll = setInterval(() => {
      fetchOrders();
      fetchBillStatus();
    }, 10000);

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(billChannel);
      clearInterval(poll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableNum]);

  const total = useMemo(
    () => orders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0),
    [orders]
  );

  const allItems = useMemo(() => {
    const list: { item: OrderItem; status: string }[] = [];
    orders.forEach((o) => {
      const items = Array.isArray(o.items) ? (o.items as OrderItem[]) : [];
      items.forEach((it) => list.push({ item: it, status: o.order_status }));
    });
    return list;
  }, [orders]);

  const requestBill = async () => {
    setRequesting(true);
    const { error } = await supabase
      .from('table_layout')
      .update({ bill_requested: true, bill_requested_at: new Date().toISOString() })
      .eq('table_number', tableNum);
    if (error) {
      console.error(error);
      toast.error('Error al solicitar la cuenta');
    } else {
      setBillRequested(true);
      toast.success('¡Enseguida te atendemos!');
    }
    setRequesting(false);
  };

  if (!Number.isFinite(tableNum)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <p className="text-muted-foreground">Mesa no válida</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-md px-4 py-8 space-y-6">
        {/* Header */}
        <header className="text-center space-y-1">
          <h1 className="text-4xl font-bold neon-text">🍽️ Mesa {tableNum}</h1>
          <p className="text-muted-foreground">Tus pedidos activos</p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-12 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-foreground font-medium">Aún no has pedido nada</p>
              <p className="text-sm text-muted-foreground">
                Escanea el menú para hacer tu primer pedido
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Resumen items */}
            <Card className="border-border">
              <CardContent className="p-4 space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Resumen
                </h2>
                <ul className="space-y-2">
                  {allItems.map(({ item, status }, i) => {
                    const s = STATUS_LABELS[status] || { label: status, color: 'bg-muted' };
                    return (
                      <li key={i} className="flex items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium shrink-0">{item.quantity}x</span>
                          <span className="truncate">{item.name}</span>
                          <Badge className={`${s.color} text-white text-[10px] shrink-0`}>
                            {s.label}
                          </Badge>
                        </div>
                        <span className="font-mono text-muted-foreground shrink-0">
                          {(item.price * item.quantity).toFixed(2)}€
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>

            {/* Total */}
            <Card className="border-primary/40 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-2xl font-bold neon-text">{total.toFixed(2)}€</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Este es el total de tu mesa
                </p>
              </CardContent>
            </Card>

            {/* Cuenta */}
            {billRequested ? (
              <Card className="border-green-500/50 bg-green-500/10">
                <CardContent className="py-5 text-center space-y-1">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-green-500" />
                  <p className="font-semibold text-green-500">✅ Cuenta solicitada</p>
                  <p className="text-sm text-muted-foreground">
                    El camarero está de camino
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Button
                variant="neon"
                size="lg"
                className="w-full h-14 text-base"
                disabled={requesting}
                onClick={requestBill}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                {requesting ? 'Solicitando...' : '💳 Solicitar la cuenta'}
              </Button>
            )}
          </>
        )}

        {/* Pedir más */}
        <div className="pt-2 space-y-2">
          <p className="text-center text-sm text-muted-foreground">
            ¿Quieres pedir algo más?
          </p>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to={`/?mesa=${tableNum}`}>
              <Plus className="w-5 h-5 mr-2" />
              Añadir más platos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MesaPanel;
