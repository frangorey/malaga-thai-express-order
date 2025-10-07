-- Insert drinks into products table, letting the database auto-generate IDs
-- First, check the current max ID and set the sequence accordingly
DO $$
DECLARE
  max_id INTEGER;
BEGIN
  SELECT COALESCE(MAX(id), 0) + 1 INTO max_id FROM products;
  EXECUTE 'ALTER SEQUENCE products_id_seq1 RESTART WITH ' || max_id;
END $$;

-- Now insert the drinks
INSERT INTO products (name, description, price, category, subcategory, is_vegetarian, is_spicy, is_available, image_url) VALUES
-- Soft drinks
('Coca Cola', 'Coca Cola 0.33L', 2.30, 'Bebidas', 'Refrescos', true, false, true, null),
('Coca Cola Zero', 'Coca Cola Zero 0.33L', 2.30, 'Bebidas', 'Refrescos', true, false, true, null),
('Fanta Naranja', 'Fanta Naranja 0.33L', 2.30, 'Bebidas', 'Refrescos', true, false, true, null),
('Fanta Limón', 'Fanta Limón 0.33L', 2.30, 'Bebidas', 'Refrescos', true, false, true, null),
('Nestea Limón', 'Nestea Limón 0.33L', 2.30, 'Bebidas', 'Refrescos', true, false, true, null),
('Nestea Maracuyá', 'Nestea Maracuyá 0.33L', 2.30, 'Bebidas', 'Refrescos', true, false, true, null),
('Aquarius Limón', 'Aquarius Limón 0.33L', 2.30, 'Bebidas', 'Refrescos', true, false, true, null),
('Aquarius Naranja', 'Aquarius Naranja 0.33L', 2.30, 'Bebidas', 'Refrescos', true, false, true, null),
('Sprite', 'Sprite 0.33L', 2.30, 'Bebidas', 'Refrescos', true, false, true, null),

-- Water
('Agua', 'Agua 0.33L', 2.00, 'Bebidas', 'Agua', true, false, true, null),
('Agua con Gas', 'Agua con Gas 0.33L', 2.30, 'Bebidas', 'Agua', true, false, true, null),

-- Juices
('Zumo Manzana', 'Zumo de Manzana 0.200L', 2.50, 'Bebidas', 'Zumos', true, false, true, null),
('Zumo Piña', 'Zumo de Piña 0.200L', 2.50, 'Bebidas', 'Zumos', true, false, true, null),
('Zumo Naranja', 'Zumo de Naranja 0.200L', 2.50, 'Bebidas', 'Zumos', true, false, true, null),
('Zumo Melocotón', 'Zumo de Melocotón 0.200L', 2.50, 'Bebidas', 'Zumos', true, false, true, null),
('Zumo Tomate', 'Zumo de Tomate 0.200L', 2.50, 'Bebidas', 'Zumos', true, false, true, null),

-- Beers
('Cerveza Shinga', 'Cerveza Shinga 1/3', 3.50, 'Bebidas', 'Cervezas', true, false, true, null),
('Cerveza Kirin', 'Cerveza Kirin 1/3', 3.50, 'Bebidas', 'Cervezas', true, false, true, null),
('Cerveza San Miguel Especial', 'Cerveza San Miguel Especial 1/3', 2.80, 'Bebidas', 'Cervezas', true, false, true, null),
('Cerveza San Miguel Sin Gluten', 'Cerveza San Miguel Sin Gluten 1/3', 3.70, 'Bebidas', 'Cervezas', true, false, true, null),
('Cerveza San Miguel 0.0', 'Cerveza San Miguel 0.0 Sin Alcohol 1/3', 3.50, 'Bebidas', 'Cervezas', true, false, true, null),
('Cerveza Alhambra Especial', 'Cerveza Alhambra Especial 1/3', 2.80, 'Bebidas', 'Cervezas', true, false, true, null),
('Cerveza Alhambra Sin Alcohol', 'Cerveza Alhambra Sin Alcohol 1/3', 2.80, 'Bebidas', 'Cervezas', true, false, true, null),

-- Wine
('Copa de Vino', 'Copa de Vino', 2.50, 'Bebidas', 'Vinos', true, false, true, null),
('Botella de Vino', 'Botella de Vino', 15.00, 'Bebidas', 'Vinos', true, false, true, null),
('Tinto de Verano', 'Tinto de Verano', 3.50, 'Bebidas', 'Vinos', true, false, true, null);