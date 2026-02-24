
-- 1. Desactivar pinchitos de champiñones (no aparecen en la nueva carta)
UPDATE products SET is_available = false WHERE id IN (196, 197);

-- 2. Actualizar precio sopa veggie de 8.10 a 8.90
UPDATE products SET price = 8.90 WHERE id IN (129, 132);

-- 3. Actualizar descripción del salmón
UPDATE products SET name = 'Salmón a la plancha', description = 'Salmón fresco a la plancha' WHERE id = 198;

-- 4. Actualizar descripciones de sopas
UPDATE products SET description = 'Tofu, wakame, cebolleta y salsa de mariscos' WHERE category = 'Sopas' AND subcategory = 'Miso';
UPDATE products SET description = 'Champiñones, zanahorias, brócoli, tomates cherry, salsa de mariscos. Poco picante' WHERE category = 'Sopas' AND subcategory = 'Tom Yam';

-- 5. Desactivar ensaladas que ya no están en la carta (solo quedan Cesar y Classic)
UPDATE products SET is_available = false WHERE category = 'Ensaladas' AND subcategory NOT IN ('Cesar', 'Classic');

-- 6. Actualizar descripción ensaladas
UPDATE products SET description = 'Lechuga, parmesano, aguacate, tomate, picatostes, salsas vinagreta y césar' WHERE category = 'Ensaladas' AND subcategory = 'Cesar';
UPDATE products SET description = 'Lechuga, parmesano, aguacate, tomates cherry, pepino, cebolla roja, picatostes, salsas vinagreta y césar' WHERE category = 'Ensaladas' AND subcategory = 'Classic';

-- 7. Añadir postres
INSERT INTO products (name, description, price, category, subcategory, is_available, is_vegetarian, is_spicy)
VALUES 
  ('Fruta Mediana Variada', 'Selección de frutas tropicales frescas variadas', 7.50, 'Postres', 'Fruta', true, true, false),
  ('Mochi', 'Delicioso mochi japonés', 1.95, 'Postres', 'Mochi', true, true, false);

-- 8. Añadir categoría "Otras cosas del mundo"
INSERT INTO products (name, description, price, category, subcategory, is_available, is_vegetarian, is_spicy)
VALUES 
  ('Set de Pollo Frito Coreano', 'Pollo frito coreano a elegir con arroz blanco, arroz japonés o patatas fritas. Salsa a elegir: agridulce, yogur con queso o miel y mostaza', 12.70, 'Otras del Mundo', 'Sets', true, false, false),
  ('Arroz Frito con Curry y Piña', 'Arroz frito aromático con curry y piña', 8.50, 'Otras del Mundo', 'Arroces', true, false, false),
  ('Pad Ka Prao', 'Con arroz blanco, huevo y verduras salteadas', 13.50, 'Otras del Mundo', 'Especialidades', true, false, false);

-- 9. Desactivar productos de arroz con teriyaki (no aparece como salsa en la nueva carta)
UPDATE products SET is_available = false WHERE category = 'Arroces' AND subcategory = 'Teriyaki';
