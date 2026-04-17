-- Limpiar pedidos antiguos pendientes que mantienen activa la alarma
DELETE FROM public.orders 
WHERE order_status IN ('received', 'confirmed', 'preparing', 'ready', 'out_for_delivery');

-- Limpiar la solicitud de cuenta de la mesa 5
UPDATE public.table_layout 
SET bill_requested = false, bill_requested_at = NULL 
WHERE bill_requested = true;