-- Add explicit DELETE policy for orders table (admin only)
CREATE POLICY "Only admins can delete orders"
ON public.orders
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));