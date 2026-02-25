
-- Add order_source column to track where orders come from (web, whatsapp, etc.)
ALTER TABLE public.orders 
ADD COLUMN order_source text NOT NULL DEFAULT 'web';

-- Add a comment for clarity
COMMENT ON COLUMN public.orders.order_source IS 'Origin of the order: web, whatsapp, etc.';
