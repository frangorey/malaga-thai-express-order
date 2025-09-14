-- Insert entrantes (starters) products
INSERT INTO products (id, name, description, price, category, subcategory, is_available, is_vegetarian, is_spicy) VALUES
-- Panko items
(190, 'Panko pollo (5 unidades)', 'Crujientes trozos de pollo empanados en panko japonés', 7.50, 'Entrantes', 'Panko', true, false, false),
(191, 'Panko langostino (5 unidades)', 'Langostinos empanados en panko crujiente', 8.65, 'Entrantes', 'Panko', true, false, false),

-- Pinchitos
(192, 'Pinchito de pollo (1 unidad)', 'Pincho de pollo marinado a la plancha', 3.75, 'Entrantes', 'Pinchitos', true, false, false),
(193, 'Pinchito de pollo (2 unidades)', 'Dos pinchos de pollo marinado a la plancha', 6.50, 'Entrantes', 'Pinchitos', true, false, false),
(194, 'Pinchito de langostino (1 unidad)', 'Pincho de langostino fresco a la plancha', 4.45, 'Entrantes', 'Pinchitos', true, false, false),
(195, 'Pinchito de langostino (2 unidades)', 'Dos pinchos de langostino fresco a la plancha', 8.50, 'Entrantes', 'Pinchitos', true, false, false),
(196, 'Pinchito de champiñones (1 unidad)', 'Pincho de champiñones frescos a la plancha', 2.35, 'Entrantes', 'Pinchitos', true, true, false),
(197, 'Pinchito de champiñones (2 unidades)', 'Dos pinchos de champiñones frescos a la plancha', 5.50, 'Entrantes', 'Pinchitos', true, true, false),

-- Especialidades
(198, 'Salmón a la plancha con salsa fruta', 'Filete de salmón a la plancha con nuestra salsa de fruta especial', 7.50, 'Entrantes', 'Especialidades', true, false, false),
(199, 'Rollito de primavera (2 unidades)', 'Rollitos crujientes rellenos de verduras frescas', 5.15, 'Entrantes', 'Rollitos', true, true, false),
(200, 'Rollito de gambas (8 unidades)', 'Rollitos crujientes rellenos de gambas frescas', 11.90, 'Entrantes', 'Rollitos', true, false, false),
(201, 'Alitas (6 unidades)', 'Alitas de pollo marinadas y especiadas', 7.50, 'Entrantes', 'Especialidades', true, false, false),

-- Gyozas - Different preparation methods as subcategories
(202, 'Gyozas con gambas fritas (6 unidades)', 'Empanadillas japonesas rellenas de gambas, preparadas fritas', 7.00, 'Entrantes', 'Gyozas Fritas', true, false, false),
(203, 'Gyozas con gambas plancha (6 unidades)', 'Empanadillas japonesas rellenas de gambas, preparadas a la plancha', 7.00, 'Entrantes', 'Gyozas Plancha', true, false, false),

-- Bao
(204, 'Bao Pollo (2 unidades)', 'Pan al vapor asiático relleno de pollo tierno', 5.80, 'Entrantes', 'Bao', true, false, false),
(205, 'Bao Langostinos (2 unidades)', 'Pan al vapor asiático relleno de langostinos frescos', 5.75, 'Entrantes', 'Bao', true, false, false),

-- Edamame
(206, 'Edamame', 'Vainas de soja hervidas con sal marina', 5.75, 'Entrantes', 'Edamame', true, true, false),
(207, 'Edamame picante', 'Vainas de soja hervidas con especias picantes', 5.95, 'Entrantes', 'Edamame', true, true, true);