-- Enable REPLICA IDENTITY FULL for real-time updates on orders table
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- Add the orders table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;