
-- Add confirmed_at column to track when waiter acknowledges the order
ALTER TABLE public.orders ADD COLUMN confirmed_at timestamp with time zone DEFAULT NULL;

-- Allow moderators (waiters) to update orders
CREATE POLICY "Waiters can update orders"
ON public.orders
FOR UPDATE
USING (has_role(auth.uid(), 'moderator'::app_role));
