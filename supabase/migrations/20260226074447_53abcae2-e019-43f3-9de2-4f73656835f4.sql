ALTER TABLE public.orders DROP CONSTRAINT orders_order_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_order_status_check
  CHECK (order_status = ANY (ARRAY[
    'received', 'confirmed', 'preparing', 'ready',
    'out_for_delivery', 'delivered', 'cancelled'
  ]));