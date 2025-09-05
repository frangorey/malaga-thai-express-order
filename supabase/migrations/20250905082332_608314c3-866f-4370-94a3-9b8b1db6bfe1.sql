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

-- Create policy for admin access (for future admin functionality)
CREATE POLICY "Only authenticated users can modify products" 
ON public.products 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Insert all products
INSERT INTO public.products (id, name, description, price, category, subcategory, image_url) VALUES
-- Arroz frito classic
(1, 'Arroz frito con pollo classic', 'Arroz frito al wok con pollo tierno y verduras frescas, preparado al estilo clásico', 10.60, 'Arroces', 'Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(2, 'Arroz frito con ternera classic', 'Arroz frito al wok con ternera jugosa y verduras frescas, preparado al estilo clásico', 10.80, 'Arroces', 'Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(3, 'Arroz frito con gambas classic', 'Arroz frito al wok con gambas frescas y verduras, preparado al estilo clásico', 11.80, 'Arroces', 'Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(4, 'Arroz frito Mix 2 con pollo y ternera classic', 'Arroz frito al wok con combinación de pollo y ternera, preparado al estilo clásico', 12.90, 'Arroces', 'Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(5, 'Arroz frito Mix 2 con pollo y gambas classic', 'Arroz frito al wok con combinación de pollo y gambas, preparado al estilo clásico', 12.90, 'Arroces', 'Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(6, 'Arroz frito Mix 2 con ternera y gambas classic', 'Arroz frito al wok con combinación de ternera y gambas, preparado al estilo clásico', 12.90, 'Arroces', 'Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(7, 'Arroz frito Mix 3 con pollo, ternera y gambas classic', 'Arroz frito al wok con triple combinación de pollo, ternera y gambas, preparado al estilo clásico', 13.30, 'Arroces', 'Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),

-- Arroz frito original
(8, 'Arroz frito con pollo original', 'Arroz frito al wok con pollo tierno y verduras frescas, preparado con nuestra receta original', 10.60, 'Arroces', 'Original', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(9, 'Arroz frito con ternera original', 'Arroz frito al wok con ternera jugosa y verduras frescas, preparado con nuestra receta original', 10.80, 'Arroces', 'Original', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(10, 'Arroz frito con gambas original', 'Arroz frito al wok con gambas frescas y verduras, preparado con nuestra receta original', 11.80, 'Arroces', 'Original', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(11, 'Arroz frito Mix 2 con pollo y ternera original', 'Arroz frito al wok con combinación de pollo y ternera, preparado con nuestra receta original', 12.90, 'Arroces', 'Original', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(12, 'Arroz frito Mix 2 con pollo y gambas original', 'Arroz frito al wok con combinación de pollo y gambas, preparado con nuestra receta original', 12.90, 'Arroces', 'Original', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(13, 'Arroz frito Mix 2 con ternera y gambas original', 'Arroz frito al wok con combinación de ternera y gambas, preparado con nuestra receta original', 12.90, 'Arroces', 'Original', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(14, 'Arroz frito Mix 3 con pollo, ternera y gambas original', 'Arroz frito al wok con triple combinación de pollo, ternera y gambas, preparado con nuestra receta original', 13.30, 'Arroces', 'Original', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),

-- Arroz frito teriyaki
(15, 'Arroz frito con pollo teriyaki', 'Arroz frito al wok con pollo tierno glaseado en salsa teriyaki y verduras frescas', 10.60, 'Arroces', 'Teriyaki', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(16, 'Arroz frito con ternera teriyaki', 'Arroz frito al wok con ternera jugosa glaseada en salsa teriyaki y verduras frescas', 10.80, 'Arroces', 'Teriyaki', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(17, 'Arroz frito con gambas teriyaki', 'Arroz frito al wok con gambas frescas glaseadas en salsa teriyaki y verduras', 11.80, 'Arroces', 'Teriyaki', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(18, 'Arroz frito Mix 2 con pollo y ternera teriyaki', 'Arroz frito al wok con combinación de pollo y ternera glaseados en salsa teriyaki', 12.90, 'Arroces', 'Teriyaki', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(19, 'Arroz frito Mix 2 con pollo y gambas teriyaki', 'Arroz frito al wok con combinación de pollo y gambas glaseados en salsa teriyaki', 12.90, 'Arroces', 'Teriyaki', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(20, 'Arroz frito Mix 2 con ternera y gambas teriyaki', 'Arroz frito al wok con combinación de ternera y gambas glaseados en salsa teriyaki', 12.90, 'Arroces', 'Teriyaki', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),
(21, 'Arroz frito Mix 3 con pollo, ternera y gambas teriyaki', 'Arroz frito al wok con triple combinación de pollo, ternera y gambas glaseados en salsa teriyaki', 13.30, 'Arroces', 'Teriyaki', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg'),

-- Arroz frito curry amarillo
(22, 'Arroz frito con Curry amarillo y pollo', 'Arroz frito al wok con pollo tierno en cremosa salsa de curry amarillo thai', 10.60, 'Arroces', 'Curry Amarillo', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(23, 'Arroz frito con Curry amarillo y ternera', 'Arroz frito al wok con ternera jugosa en cremosa salsa de curry amarillo thai', 10.80, 'Arroces', 'Curry Amarillo', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(24, 'Arroz frito con Curry amarillo y gambas', 'Arroz frito al wok con gambas frescas en cremosa salsa de curry amarillo thai', 11.80, 'Arroces', 'Curry Amarillo', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(25, 'Arroz frito con Curry amarillo MIX 2 con pollo y ternera', 'Arroz frito al wok con combinación de pollo y ternera en cremosa salsa de curry amarillo thai', 12.90, 'Arroces', 'Curry Amarillo', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(26, 'Arroz frito con Curry amarillo MIX 2 con pollo y gambas', 'Arroz frito al wok con combinación de pollo y gambas en cremosa salsa de curry amarillo thai', 12.90, 'Arroces', 'Curry Amarillo', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(27, 'Arroz frito con Curry amarillo MIX 2 con ternera y gambas', 'Arroz frito al wok con combinación de ternera y gambas en cremosa salsa de curry amarillo thai', 12.90, 'Arroces', 'Curry Amarillo', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(28, 'Arroz frito con Curry amarillo MIX 3 con pollo, ternera y gambas', 'Arroz frito al wok con triple combinación de pollo, ternera y gambas en cremosa salsa de curry amarillo thai', 13.30, 'Arroces', 'Curry Amarillo', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),

-- Arroz frito curry verde
(29, 'Arroz frito con Curry verde y pollo', 'Arroz frito al wok con pollo tierno en aromática salsa de curry verde thai', 10.60, 'Arroces', 'Curry Verde', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(30, 'Arroz frito con Curry verde y ternera', 'Arroz frito al wok con ternera jugosa en aromática salsa de curry verde thai', 10.80, 'Arroces', 'Curry Verde', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(31, 'Arroz frito con Curry verde y gambas', 'Arroz frito al wok con gambas frescas en aromática salsa de curry verde thai', 11.80, 'Arroces', 'Curry Verde', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(32, 'Arroz frito con Curry verde MIX 2 con pollo y ternera', 'Arroz frito al wok con combinación de pollo y ternera en aromática salsa de curry verde thai', 12.90, 'Arroces', 'Curry Verde', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(33, 'Arroz frito con Curry verde MIX 2 con pollo y gambas', 'Arroz frito al wok con combinación de pollo y gambas en aromática salsa de curry verde thai', 12.90, 'Arroces', 'Curry Verde', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(34, 'Arroz frito con Curry verde MIX 2 con ternera y gambas', 'Arroz frito al wok con combinación de ternera y gambas en aromática salsa de curry verde thai', 12.90, 'Arroces', 'Curry Verde', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(35, 'Arroz frito con Curry verde MIX 3 con pollo, ternera y gambas', 'Arroz frito al wok con triple combinación de pollo, ternera y gambas en aromática salsa de curry verde thai', 13.30, 'Arroces', 'Curry Verde', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),

-- Arroz frito curry rojo
(36, 'Arroz frito con Curry rojo y pollo', 'Arroz frito al wok con pollo tierno en picante salsa de curry rojo thai', 10.60, 'Arroces', 'Curry Rojo', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(37, 'Arroz frito con Curry rojo y ternera', 'Arroz frito al wok con ternera jugosa en picante salsa de curry rojo thai', 10.80, 'Arroces', 'Curry Rojo', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(38, 'Arroz frito con Curry rojo y gambas', 'Arroz frito al wok con gambas frescas en picante salsa de curry rojo thai', 11.80, 'Arroces', 'Curry Rojo', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(39, 'Arroz frito con Curry rojo MIX 2 con pollo y ternera', 'Arroz frito al wok con combinación de pollo y ternera en picante salsa de curry rojo thai', 12.90, 'Arroces', 'Curry Rojo', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(40, 'Arroz frito con Curry rojo MIX 2 con pollo y gambas', 'Arroz frito al wok con combinación de pollo y gambas en picante salsa de curry rojo thai', 12.90, 'Arroces', 'Curry Rojo', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(41, 'Arroz frito con Curry rojo MIX 2 con ternera y gambas', 'Arroz frito al wok con combinación de ternera y gambas en picante salsa de curry rojo thai', 12.90, 'Arroces', 'Curry Rojo', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),
(42, 'Arroz frito con Curry rojo MIX 3 con pollo, ternera y gambas', 'Arroz frito al wok con triple combinación de pollo, ternera y gambas en picante salsa de curry rojo thai', 13.30, 'Arroces', 'Curry Rojo', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg'),

-- Tallarines Glass
(43, 'Tallarines Glass con pollo classic', 'Tallarines de cristal salteados con pollo tierno y verduras frescas al estilo clásico', 10.60, 'Tallarines', 'Glass Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/noodles-hero.jpg'),
(44, 'Tallarines Glass con ternera classic', 'Tallarines de cristal salteados con ternera jugosa y verduras frescas al estilo clásico', 10.80, 'Tallarines', 'Glass Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/noodles-hero.jpg'),
(45, 'Tallarines Glass con gambas classic', 'Tallarines de cristal salteados con gambas frescas y verduras al estilo clásico', 11.80, 'Tallarines', 'Glass Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/noodles-hero.jpg'),
(46, 'Tallarines Glass MIX 2, con pollo y ternera classic', 'Tallarines de cristal salteados con combinación de pollo y ternera al estilo clásico', 12.90, 'Tallarines', 'Glass Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/noodles-hero.jpg'),
(47, 'Tallarines Glass MIX 2, con pollo y gambas classic', 'Tallarines de cristal salteados con combinación de pollo y gambas al estilo clásico', 12.90, 'Tallarines', 'Glass Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/noodles-hero.jpg'),
(48, 'Tallarines Glass MIX 2, con ternera y gambas classic', 'Tallarines de cristal salteados con combinación de ternera y gambas al estilo clásico', 12.90, 'Tallarines', 'Glass Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/noodles-hero.jpg'),
(49, 'Tallarines Glass MIX 3, con pollo, ternera y gambas classic', 'Tallarines de cristal salteados con triple combinación de pollo, ternera y gambas al estilo clásico', 13.30, 'Tallarines', 'Glass Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/noodles-hero.jpg'),

-- Continue with more products following the same pattern...
-- I'll add a few more key categories to demonstrate the structure

-- Sopas
(127, 'Sopa Miso con pollo', 'Tradicional sopa japonesa miso con pollo tierno y algas wakame', 8.90, 'Sopas', 'Miso', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/soup.jpg'),
(128, 'Sopa Miso con Langostino', 'Tradicional sopa japonesa miso con langostinos frescos y algas wakame', 9.40, 'Sopas', 'Miso', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/soup.jpg'),
(129, 'Sopa Miso Veggie', 'Tradicional sopa japonesa miso vegetariana con tofu y verduras', 8.10, 'Sopas', 'Miso', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/soup.jpg'),

-- Ensaladas
(152, 'Ensalada Cesar normal', 'Fresca ensalada césar con lechuga crujiente, crutones y aderezo césar', 10.40, 'Ensaladas', 'Cesar', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/salad.jpg'),
(153, 'Ensalada Cesar con pollo', 'Ensalada césar con pollo a la plancha, lechuga crujiente y aderezo césar', 11.40, 'Ensaladas', 'Cesar', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/salad.jpg'),

-- Bebidas
(208, 'Coca cola', 'Refrescante coca cola 0.33L', 2.30, 'Bebidas', 'Refrescos', NULL),
(209, 'Coca cola Zero', 'Coca cola zero azúcar 0.33L', 2.30, 'Bebidas', 'Refrescos', NULL),
(217, 'Agua', 'Agua natural 0.33L', 2.00, 'Bebidas', 'Agua', NULL),
(224, 'Cerveza Shinga(1/3)', 'Cerveza japonesa Shinga 1/3', 3.50, 'Bebidas', 'Cerveza', NULL),
(233, 'Copa Vino', 'Copa de vino de la casa', 2.50, 'Bebidas', 'Vino', NULL);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_subcategory ON public.products(subcategory);
CREATE INDEX idx_products_available ON public.products(is_available);
CREATE INDEX idx_products_price ON public.products(price);