-- First, recreate the products table
CREATE TABLE public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
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

-- Create policy for public read access
CREATE POLICY "Products are viewable by everyone" 
ON public.products FOR SELECT USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create sauces table
CREATE TABLE public.sauces (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ingredients table  
CREATE TABLE public.ingredients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL, -- 'protein', 'vegetable', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product_sauces junction table (many-to-many)
CREATE TABLE public.product_sauces (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  sauce_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, sauce_id)
);

-- Create product_ingredients junction table (many-to-many)
CREATE TABLE public.product_ingredients (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  ingredient_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, ingredient_id)
);

-- Insert sauces
INSERT INTO public.sauces (name, description) VALUES
('Classic', 'Salsa clásica tailandesa'),
('Original', 'Salsa original de la casa'),
('Teriyaki', 'Salsa teriyaki japonesa'),
('Curry Amarillo', 'Curry tailandés amarillo'),
('Curry Verde', 'Curry tailandés verde'),
('Curry Rojo', 'Curry tailandés rojo');

-- Insert ingredients
INSERT INTO public.ingredients (name, type) VALUES
('Pollo', 'protein'),
('Ternera', 'protein'),
('Gambas', 'protein'),
('Mix 2 Pollo y Ternera', 'protein_mix'),
('Mix 2 Pollo y Gambas', 'protein_mix'),
('Mix 2 Ternera y Gambas', 'protein_mix'),
('Mix 3 Pollo, Ternera y Gambas', 'protein_mix');

-- Insert arroz frito products organized by sauce type
INSERT INTO public.products (name, description, price, category, subcategory, is_vegetarian, is_spicy, is_available) VALUES
-- Classic sauce products
('Arroz frito con pollo classic', 'Arroz frito con pollo y salsa classic', 10.60, 'Arroces', 'Classic', false, false, true),
('Arroz frito con ternera classic', 'Arroz frito con ternera y salsa classic', 10.80, 'Arroces', 'Classic', false, false, true),
('Arroz frito con gambas classic', 'Arroz frito con gambas y salsa classic', 11.80, 'Arroces', 'Classic', false, false, true),
('Arroz frito Mix 2 con pollo y ternera classic', 'Arroz frito mix 2 con pollo y ternera con salsa classic', 12.90, 'Arroces', 'Classic', false, false, true),
('Arroz frito Mix 2 con pollo y gambas classic', 'Arroz frito mix 2 con pollo y gambas con salsa classic', 12.90, 'Arroces', 'Classic', false, false, true),
('Arroz frito Mix 2 con ternera y gambas classic', 'Arroz frito mix 2 con ternera y gambas con salsa classic', 12.90, 'Arroces', 'Classic', false, false, true),
('Arroz frito Mix 3 con pollo, ternera y gambas classic', 'Arroz frito mix 3 con pollo, ternera y gambas con salsa classic', 13.30, 'Arroces', 'Classic', false, false, true),

-- Original sauce products
('Arroz frito con pollo original', 'Arroz frito con pollo y salsa original', 10.60, 'Arroces', 'Original', false, false, true),
('Arroz frito con ternera original', 'Arroz frito con ternera y salsa original', 10.80, 'Arroces', 'Original', false, false, true),
('Arroz frito con gambas original', 'Arroz frito con gambas y salsa original', 11.80, 'Arroces', 'Original', false, false, true),
('Arroz frito Mix 2 con pollo y ternera original', 'Arroz frito mix 2 con pollo y ternera con salsa original', 12.90, 'Arroces', 'Original', false, false, true),
('Arroz frito Mix 2 con pollo y gambas original', 'Arroz frito mix 2 con pollo y gambas con salsa original', 12.90, 'Arroces', 'Original', false, false, true),
('Arroz frito Mix 2 con ternera y gambas original', 'Arroz frito mix 2 con ternera y gambas con salsa original', 12.90, 'Arroces', 'Original', false, false, true),
('Arroz frito Mix 3 con pollo, ternera y gambas original', 'Arroz frito mix 3 con pollo, ternera y gambas con salsa original', 13.30, 'Arroces', 'Original', false, false, true),

-- Teriyaki sauce products
('Arroz frito con pollo teriyaki', 'Arroz frito con pollo y salsa teriyaki', 10.60, 'Arroces', 'Teriyaki', false, false, true),
('Arroz frito con ternera teriyaki', 'Arroz frito con ternera y salsa teriyaki', 10.80, 'Arroces', 'Teriyaki', false, false, true),
('Arroz frito con gambas teriyaki', 'Arroz frito con gambas y salsa teriyaki', 11.80, 'Arroces', 'Teriyaki', false, false, true),
('Arroz frito Mix 2 con pollo y ternera teriyaki', 'Arroz frito mix 2 con pollo y ternera con salsa teriyaki', 12.90, 'Arroces', 'Teriyaki', false, false, true),
('Arroz frito Mix 2 con pollo y gambas teriyaki', 'Arroz frito mix 2 con pollo y gambas con salsa teriyaki', 12.90, 'Arroces', 'Teriyaki', false, false, true),
('Arroz frito Mix 2 con ternera y gambas teriyaki', 'Arroz frito mix 2 con ternera y gambas con salsa teriyaki', 12.90, 'Arroces', 'Teriyaki', false, false, true),
('Arroz frito Mix 3 con pollo, ternera y gambas teriyaki', 'Arroz frito mix 3 con pollo, ternera y gambas con salsa teriyaki', 13.30, 'Arroces', 'Teriyaki', false, false, true),

-- Curry Amarillo products
('Arroz frito con Curry amarillo y pollo', 'Arroz frito con pollo y curry amarillo', 10.60, 'Arroces', 'Curry Amarillo', false, true, true),
('Arroz frito con Curry amarillo y ternera', 'Arroz frito con ternera y curry amarillo', 10.80, 'Arroces', 'Curry Amarillo', false, true, true),
('Arroz frito con Curry amarillo y gambas', 'Arroz frito con gambas y curry amarillo', 11.80, 'Arroces', 'Curry Amarillo', false, true, true),
('Arroz frito con Curry amarillo MIX 2 con pollo y ternera', 'Arroz frito mix 2 con pollo y ternera con curry amarillo', 12.90, 'Arroces', 'Curry Amarillo', false, true, true),
('Arroz frito con Curry amarillo MIX 2 con pollo y gambas', 'Arroz frito mix 2 con pollo y gambas con curry amarillo', 12.90, 'Arroces', 'Curry Amarillo', false, true, true),
('Arroz frito con Curry amarillo MIX 2 con ternera y gambas', 'Arroz frito mix 2 con ternera y gambas con curry amarillo', 12.90, 'Arroces', 'Curry Amarillo', false, true, true),
('Arroz frito con Curry amarillo MIX 3 con pollo, ternera y gambas', 'Arroz frito mix 3 con pollo, ternera y gambas con curry amarillo', 13.30, 'Arroces', 'Curry Amarillo', false, true, true),

-- Curry Verde products
('Arroz frito con Curry verde y pollo', 'Arroz frito con pollo y curry verde', 10.60, 'Arroces', 'Curry Verde', false, true, true),
('Arroz frito con Curry verde y ternera', 'Arroz frito con ternera y curry verde', 10.80, 'Arroces', 'Curry Verde', false, true, true),
('Arroz frito con Curry verde y gambas', 'Arroz frito con gambas y curry verde', 11.80, 'Arroces', 'Curry Verde', false, true, true),
('Arroz frito con Curry verde MIX 2 con pollo y ternera', 'Arroz frito mix 2 con pollo y ternera con curry verde', 12.90, 'Arroces', 'Curry Verde', false, true, true),
('Arroz frito con Curry verde MIX 2 con pollo y gambas', 'Arroz frito mix 2 con pollo y gambas con curry verde', 12.90, 'Arroces', 'Curry Verde', false, true, true),
('Arroz frito con Curry verde MIX 2 con ternera y gambas', 'Arroz frito mix 2 con ternera y gambas con curry verde', 12.90, 'Arroces', 'Curry Verde', false, true, true),
('Arroz frito con Curry verde MIX 3 con pollo, ternera y gambas', 'Arroz frito mix 3 con pollo, ternera y gambas con curry verde', 13.30, 'Arroces', 'Curry Verde', false, true, true),

-- Curry Rojo products
('Arroz frito con Curry rojo y pollo', 'Arroz frito con pollo y curry rojo', 10.60, 'Arroces', 'Curry Rojo', false, true, true),
('Arroz frito con Curry rojo y ternera', 'Arroz frito con ternera y curry rojo', 10.80, 'Arroces', 'Curry Rojo', false, true, true),
('Arroz frito con Curry rojo y gambas', 'Arroz frito con gambas y curry rojo', 11.80, 'Arroces', 'Curry Rojo', false, true, true),
('Arroz frito con Curry rojo MIX 2 con pollo y ternera', 'Arroz frito mix 2 con pollo y ternera con curry rojo', 12.90, 'Arroces', 'Curry Rojo', false, true, true),
('Arroz frito con Curry rojo MIX 2 con pollo y gambas', 'Arroz frito mix 2 con pollo y gambas con curry rojo', 12.90, 'Arroces', 'Curry Rojo', false, true, true),
('Arroz frito con Curry rojo MIX 2 con ternera y gambas', 'Arroz frito mix 2 con ternera y gambas con curry rojo', 12.90, 'Arroces', 'Curry Rojo', false, true, true),
('Arroz frito con Curry rojo MIX 3 con pollo, ternera y gambas', 'Arroz frito mix 3 con pollo, ternera y gambas con curry rojo', 13.30, 'Arroces', 'Curry Rojo', false, true, true);

-- Add foreign key constraints and relationships after all tables are created
ALTER TABLE product_sauces 
ADD CONSTRAINT fk_product_sauces_product 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_sauces 
ADD CONSTRAINT fk_product_sauces_sauce 
FOREIGN KEY (sauce_id) REFERENCES sauces(id) ON DELETE CASCADE;

ALTER TABLE product_ingredients 
ADD CONSTRAINT fk_product_ingredients_product 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_ingredients 
ADD CONSTRAINT fk_product_ingredients_ingredient 
FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE;

-- Enable RLS on new tables
ALTER TABLE public.sauces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sauces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Sauces are viewable by everyone" 
ON public.sauces FOR SELECT USING (true);

CREATE POLICY "Ingredients are viewable by everyone" 
ON public.ingredients FOR SELECT USING (true);

CREATE POLICY "Product sauces are viewable by everyone" 
ON public.product_sauces FOR SELECT USING (true);

CREATE POLICY "Product ingredients are viewable by everyone" 
ON public.product_ingredients FOR SELECT USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_sauces_updated_at
BEFORE UPDATE ON public.sauces
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ingredients_updated_at
BEFORE UPDATE ON public.ingredients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();