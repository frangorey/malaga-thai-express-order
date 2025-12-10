import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrderUpdate {
  id: string;
  order_number: string;
  order_status: string;
  payment_status: string;
  updated_at: string;
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  received: 'Recibido',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  ready: 'Listo para recoger',
  out_for_delivery: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const ORDER_STATUS_EMOJIS: Record<string, string> = {
  received: '📋',
  confirmed: '✅',
  preparing: '👨‍🍳',
  ready: '🔔',
  out_for_delivery: '🚴',
  delivered: '🎉',
  cancelled: '❌',
};

export function useOrderRealtime(orderNumber?: string) {
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!orderNumber) return;

    console.log('Setting up realtime subscription for order:', orderNumber);

    const channel = supabase
      .channel(`order-updates-${orderNumber}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `order_number=eq.${orderNumber}`,
        },
        (payload) => {
          console.log('Order update received:', payload);
          const newOrder = payload.new as OrderUpdate;
          const oldOrder = payload.old as OrderUpdate;

          // Check if status changed
          if (newOrder.order_status !== oldOrder.order_status) {
            setCurrentStatus(newOrder.order_status);
            
            const statusLabel = ORDER_STATUS_LABELS[newOrder.order_status] || newOrder.order_status;
            const emoji = ORDER_STATUS_EMOJIS[newOrder.order_status] || '📦';

            toast({
              title: `${emoji} Actualización de pedido`,
              description: `Tu pedido ${newOrder.order_number} ahora está: ${statusLabel}`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [orderNumber, toast]);

  return {
    currentStatus,
    isConnected,
    statusLabel: currentStatus ? ORDER_STATUS_LABELS[currentStatus] : null,
    statusEmoji: currentStatus ? ORDER_STATUS_EMOJIS[currentStatus] : null,
  };
}

// Hook to track multiple orders for a user session
export function useActiveOrdersRealtime() {
  const [activeOrders, setActiveOrders] = useState<OrderUpdate[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Get order numbers from localStorage (set when order is placed)
    const storedOrders = localStorage.getItem('activeOrderNumbers');
    if (!storedOrders) return;

    const orderNumbers: string[] = JSON.parse(storedOrders);
    if (orderNumbers.length === 0) return;

    console.log('Setting up realtime for active orders:', orderNumbers);

    const channel = supabase
      .channel('active-orders-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new as OrderUpdate;
          const oldOrder = payload.old as OrderUpdate;

          // Only process if it's one of our tracked orders
          if (!orderNumbers.includes(newOrder.order_number)) return;

          console.log('Active order update:', newOrder);

          // Update local state
          setActiveOrders((prev) => {
            const existing = prev.findIndex((o) => o.id === newOrder.id);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = newOrder;
              return updated;
            }
            return [...prev, newOrder];
          });

          // Show toast if status changed
          if (newOrder.order_status !== oldOrder.order_status) {
            const statusLabel = ORDER_STATUS_LABELS[newOrder.order_status] || newOrder.order_status;
            const emoji = ORDER_STATUS_EMOJIS[newOrder.order_status] || '📦';

            toast({
              title: `${emoji} Actualización de pedido`,
              description: `Pedido ${newOrder.order_number}: ${statusLabel}`,
              duration: 5000,
            });

            // Remove from tracking if delivered or cancelled
            if (['delivered', 'cancelled'].includes(newOrder.order_status)) {
              const updatedNumbers = orderNumbers.filter((n) => n !== newOrder.order_number);
              localStorage.setItem('activeOrderNumbers', JSON.stringify(updatedNumbers));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return { activeOrders };
}

// Utility to add order to tracking
export function trackOrder(orderNumber: string) {
  const stored = localStorage.getItem('activeOrderNumbers');
  const orders: string[] = stored ? JSON.parse(stored) : [];
  
  if (!orders.includes(orderNumber)) {
    orders.push(orderNumber);
    localStorage.setItem('activeOrderNumbers', JSON.stringify(orders));
  }
}
