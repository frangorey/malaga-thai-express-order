-- Clear existing products and replace with the new 42 arroz frito products
TRUNCATE TABLE public.products RESTART IDENTITY CASCADE;

-- Insert all 42 arroz frito products organized by sauce type
INSERT INTO public.products (name, description, price, category, subcategory, is_vegetarian, is_spicy, is_available) VALUES
-- Classic sauce products (1-7)
('Arroz frito con pollo classic', 'Arroz frito con pollo y salsa classic', 10.60, 'Arroces', 'Classic', false, false, true),
('Arroz frito con ternera classic', 'Arroz frito con ternera y salsa classic', 10.80, 'Arroces', 'Classic', false, false, true),
('Arroz frito con gambas classic', 'Arroz frito con gambas y salsa classic', 11.80, 'Arroces', 'Classic', false, false, true),
('Arroz frito Mix 2 con pollo y ternera classic', 'Arroz frito mix 2 con pollo y ternera con salsa classic', 12.90, 'Arroces', 'Classic', false, false, true),
('Arroz frito Mix 2 con pollo y gambas classic', 'Arroz frito mix 2 con pollo y gambas con salsa classic', 12.90, 'Arroces', 'Classic', false, false, true),
('Arroz frito Mix 2 con ternera y gambas classic', 'Arroz frito mix 2 con ternera y gambas con salsa classic', 12.90, 'Arroces', 'Classic', false, false, true),
('Arroz frito Mix 3 con pollo, ternera y gambas classic', 'Arroz frito mix 3 con pollo, ternera y gambas con salsa classic', 13.30, 'Arroces', 'Classic', false, false, true),

-- Original sauce products (8-14)
('Arroz frito con pollo original', 'Arroz frito con pollo y salsa original', 10.60, 'Arroces', 'Original', false, false, true),
('Arroz frito con ternera original', 'Arroz frito con ternera y salsa original', 10.80, 'Arroces', 'Original', false, false, true),
('Arroz frito con gambas original', 'Arroz frito con gambas y salsa original', 11.80, 'Arroces', 'Original', false, false, true),
('Arroz frito Mix 2 con pollo y ternera original', 'Arroz frito mix 2 con pollo y ternera con salsa original', 12.90, 'Arroces', 'Original', false, false, true),
('Arroz frito Mix 2 con pollo y gambas original', 'Arroz frito mix 2 con pollo y gambas con salsa original', 12.90, 'Arroces', 'Original', false, false, true),
('Arroz frito Mix 2 con ternera y gambas original', 'Arroz frito mix 2 con ternera y gambas con salsa original', 12.90, 'Arroces', 'Original', false, false, true),
('Arroz frito Mix 3 con pollo, ternera y gambas original', 'Arroz frito mix 3 con pollo, ternera y gambas con salsa original', 13.30, 'Arroces', 'Original', false, false, true),

-- Teriyaki sauce products (15-21)
('Arroz frito con pollo teriyaki', 'Arroz frito con pollo y salsa teriyaki', 10.60, 'Arroces', 'Teriyaki', false, false, true),
('Arroz frito con ternera teriyaki', 'Arroz frito con ternera y salsa teriyaki', 10.80, 'Arroces', 'Teriyaki', false, false, true),
('Arroz frito con gambas teriyaki', 'Arroz frito con gambas y salsa teriyaki', 11.80, 'Arroces', 'Teriyaki', false, false, true),
('Arroz frito Mix 2 con pollo y ternera teriyaki', 'Arroz frito mix 2 con pollo y ternera con salsa teriyaki', 12.90, 'Arroces', 'Teriyaki', false, false, true),
('Arroz frito Mix 2 con pollo y gambas teriyaki', 'Arroz frito mix 2 con pollo y gambas con salsa teriyaki', 12.90, 'Arroces', 'Teriyaki', false, false, true),
('Arroz frito Mix 2 con ternera y gambas teriyaki', 'Arroz frito mix 2 con ternera y gambas con salsa teriyaki', 12.90, 'Arroces', 'Teriyaki', false, false, true),
('Arroz frito Mix 3 con pollo, ternera y gambas teriyaki', 'Arroz frito mix 3 con pollo, ternera y gambas con salsa teriyaki', 13.30, 'Arroces', 'Teriyaki', false, false, true),

-- Curry Amarillo products (22-28)
('Arroz frito con Curry amarillo y pollo', 'Arroz frito con pollo y curry amarillo', 10.60, 'Arroces', 'Curry Amarillo', false, true, true),
('Arroz frito con Curry amarillo y ternera', 'Arroz frito con ternera y curry amarillo', 10.80, 'Arroces', 'Curry Amarillo', false, true, true),
('Arroz frito con Curry amarillo y gambas', 'Arroz frito con gambas y curry amarillo', 11.80, 'Arroces', 'Curry Amarillo', false, true, true),
('Arroz frito con Curry amarillo MIX 2 con pollo y ternera', 'Arroz frito mix 2 con pollo y ternera con curry amarillo', 12.90, 'Arroces', 'Curry Amarillo', false, true, true),
('Arroz frito con Curry amarillo MIX 2 con pollo y gambas', 'Arroz frito mix 2 con pollo y gambas con curry amarillo', 12.90, 'Arroces', 'Curry Amarillo', false, true, true),
('Arroz frito con Curry amarillo MIX 2 con ternera y gambas', 'Arroz frito mix 2 con ternera y gambas con curry amarillo', 12.90, 'Arroces', 'Curry Amarillo', false, true, true),
('Arroz frito con Curry amarillo MIX 3 con pollo, ternera y gambas', 'Arroz frito mix 3 con pollo, ternera y gambas con curry amarillo', 13.30, 'Arroces', 'Curry Amarillo', false, true, true),

-- Curry Verde products (29-35)
('Arroz frito con Curry verde y pollo', 'Arroz frito con pollo y curry verde', 10.60, 'Arroces', 'Curry Verde', false, true, true),
('Arroz frito con Curry verde y ternera', 'Arroz frito con ternera y curry verde', 10.80, 'Arroces', 'Curry Verde', false, true, true),
('Arroz frito con Curry verde y gambas', 'Arroz frito con gambas y curry verde', 11.80, 'Arroces', 'Curry Verde', false, true, true),
('Arroz frito con Curry verde MIX 2 con pollo y ternera', 'Arroz frito mix 2 con pollo y ternera con curry verde', 12.90, 'Arroces', 'Curry Verde', false, true, true),
('Arroz frito con Curry verde MIX 2 con pollo y gambas', 'Arroz frito mix 2 con pollo y gambas con curry verde', 12.90, 'Arroces', 'Curry Verde', false, true, true),
('Arroz frito con Curry verde MIX 2 con ternera y gambas', 'Arroz frito mix 2 con ternera y gambas con curry verde', 12.90, 'Arroces', 'Curry Verde', false, true, true),
('Arroz frito con Curry verde MIX 3 con pollo, ternera y gambas', 'Arroz frito mix 3 con pollo, ternera y gambas con curry verde', 13.30, 'Arroces', 'Curry Verde', false, true, true),

-- Curry Rojo products (36-42)
('Arroz frito con Curry rojo y pollo', 'Arroz frito con pollo y curry rojo', 10.60, 'Arroces', 'Curry Rojo', false, true, true),
('Arroz frito con Curry rojo y ternera', 'Arroz frito con ternera y curry rojo', 10.80, 'Arroces', 'Curry Rojo', false, true, true),
('Arroz frito con Curry rojo y gambas', 'Arroz frito con gambas y curry rojo', 11.80, 'Arroces', 'Curry Rojo', false, true, true),
('Arroz frito con Curry rojo MIX 2 con pollo y ternera', 'Arroz frito mix 2 con pollo y ternera con curry rojo', 12.90, 'Arroces', 'Curry Rojo', false, true, true),
('Arroz frito con Curry rojo MIX 2 con pollo y gambas', 'Arroz frito mix 2 con pollo y gambas con curry rojo', 12.90, 'Arroces', 'Curry Rojo', false, true, true),
('Arroz frito con Curry rojo MIX 2 con ternera y gambas', 'Arroz frito mix 2 con ternera y gambas con curry rojo', 12.90, 'Arroces', 'Curry Rojo', false, true, true),
('Arroz frito con Curry rojo MIX 3 con pollo, ternera y gambas', 'Arroz frito mix 3 con pollo, ternera y gambas con curry rojo', 13.30, 'Arroces', 'Curry Rojo', false, true, true);

-- Recreate relationships in junction tables
DELETE FROM product_sauces;
DELETE FROM product_ingredients;

-- Create relationships between products and sauces
INSERT INTO product_sauces (product_id, sauce_id)
SELECT p.id, s.id
FROM products p 
JOIN sauces s ON LOWER(p.subcategory) = LOWER(s.name)
WHERE p.subcategory IS NOT NULL;

-- Create relationships between products and ingredients
INSERT INTO product_ingredients (product_id, ingredient_id)
SELECT DISTINCT p.id, i.id
FROM products p
CROSS JOIN ingredients i
WHERE 
  (LOWER(p.name) LIKE '%pollo%' AND LOWER(i.name) = 'pollo' AND LOWER(p.name) NOT LIKE '%mix%') OR
  (LOWER(p.name) LIKE '%ternera%' AND LOWER(i.name) = 'ternera' AND LOWER(p.name) NOT LIKE '%mix%') OR
  (LOWER(p.name) LIKE '%gambas%' AND LOWER(i.name) = 'gambas' AND LOWER(p.name) NOT LIKE '%mix%') OR
  (LOWER(p.name) LIKE '%mix 2%' AND LOWER(p.name) LIKE '%pollo%' AND LOWER(p.name) LIKE '%ternera%' AND LOWER(i.name) = 'mix 2 pollo y ternera') OR
  (LOWER(p.name) LIKE '%mix 2%' AND LOWER(p.name) LIKE '%pollo%' AND LOWER(p.name) LIKE '%gambas%' AND LOWER(i.name) = 'mix 2 pollo y gambas') OR
  (LOWER(p.name) LIKE '%mix 2%' AND LOWER(p.name) LIKE '%ternera%' AND LOWER(p.name) LIKE '%gambas%' AND LOWER(i.name) = 'mix 2 ternera y gambas') OR
  (LOWER(p.name) LIKE '%mix 3%' AND LOWER(i.name) = 'mix 3 pollo, ternera y gambas');