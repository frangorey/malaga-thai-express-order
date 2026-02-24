
-- Add table_number column to orders for dine-in orders
ALTER TABLE public.orders 
ADD COLUMN table_number integer NULL;

-- Add RLS policy for waiters (moderator role) to view all orders
CREATE POLICY "Waiters can view all orders" 
ON public.orders 
FOR SELECT 
USING (has_role(auth.uid(), 'moderator'::app_role));

-- Allow admins to update products (for photo upload)
CREATE POLICY "Admins can update products" 
ON public.products 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update arroz_frito_classic" 
ON public."Arroz_frito_classic" 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));
