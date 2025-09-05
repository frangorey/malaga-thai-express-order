-- First create the update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create products table with all necessary fields
CREATE TABLE public.products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  is_vegetarian BOOLEAN DEFAULT false,
  is_spicy BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (since this is a restaurant menu)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample products to demonstrate the structure
INSERT INTO public.products (id, name, description, price, category, subcategory, image_url) VALUES
-- Arroz frito classic
(1, 'Arroz frito con pollo classic', 'Arroz frito al wok con pollo tierno y verduras frescas, preparado al estilo clásico', 10.60, 'Arroces', 'Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(2, 'Arroz frito con ternera classic', 'Arroz frito al wok con ternera jugosa y verduras frescas, preparado al estilo clásico', 10.80, 'Arroces', 'Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(3, 'Arroz frito con gambas classic', 'Arroz frito al wok con gambas frescas y verduras, preparado al estilo clásico', 11.80, 'Arroces', 'Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),

-- Sopas
(127, 'Sopa Miso con pollo', 'Tradicional sopa japonesa miso con pollo tierno y algas wakame', 8.90, 'Sopas', 'Miso', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/soup.jpg'),
(128, 'Sopa Miso con Langostino', 'Tradicional sopa japonesa miso con langostinos frescos y algas wakame', 9.40, 'Sopas', 'Miso', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/soup.jpg'),

-- Ensaladas  
(152, 'Ensalada Cesar normal', 'Fresca ensalada césar con lechuga crujiente, crutones y aderezo césar', 10.40, 'Ensaladas', 'Cesar', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/salad.jpg'),

-- Bebidas
(208, 'Coca cola', 'Refrescante coca cola 0.33L', 2.30, 'Bebidas', 'Refrescos', NULL),
(217, 'Agua', 'Agua natural 0.33L', 2.00, 'Bebidas', 'Agua', NULL);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_subcategory ON public.products(subcategory);
CREATE INDEX idx_products_available ON public.products(is_available);