-- 1. Enable salads: Malaysia, Thailandia, Crispy, Fruta
UPDATE products SET is_available = true WHERE id IN (242, 243, 244, 245); -- Malaysia
UPDATE products SET is_available = true WHERE id IN (250, 251, 252, 253); -- Thailandia
UPDATE products SET is_available = true WHERE id IN (258, 259, 260, 261); -- Crispy
UPDATE products SET is_available = true WHERE id IN (262, 263, 264, 265); -- Fruta

-- 2. Add Tonkatsu variants
INSERT INTO products (name, description, price, category, subcategory, is_available) VALUES
('Tonkatsu con Arroz Frito y Salsa Agridulce', 'Pollo frito estilo japonés con arroz frito con huevo y salsa agridulce', 13.50, 'Otras del Mundo', 'Tonkatsu', true),
('Tonkatsu con Arroz Frito y Salsa Barbacoa', 'Pollo frito estilo japonés con arroz frito con huevo y salsa barbacoa', 13.50, 'Otras del Mundo', 'Tonkatsu', true),
('Tonkatsu con Fideos Fritos y Salsa Agridulce', 'Pollo frito estilo japonés con fideos finos fritos con huevo y salsa agridulce', 13.50, 'Otras del Mundo', 'Tonkatsu', true),
('Tonkatsu con Fideos Fritos y Salsa Barbacoa', 'Pollo frito estilo japonés con fideos finos fritos con huevo y salsa barbacoa', 13.50, 'Otras del Mundo', 'Tonkatsu', true);

-- 3. Add Set de Pollo Frito Coreano variants (expand the existing single product into variants)
INSERT INTO products (name, description, price, category, subcategory, is_available) VALUES
('Set Pollo Coreano con Arroz Blanco y Salsa Agridulce', 'Set de pollo frito coreano con arroz blanco y salsa agridulce', 12.70, 'Otras del Mundo', 'Sets', true),
('Set Pollo Coreano con Arroz Blanco y Salsa Yogur', 'Set de pollo frito coreano con arroz blanco y salsa yogur con queso', 12.70, 'Otras del Mundo', 'Sets', true),
('Set Pollo Coreano con Arroz Blanco y Salsa Miel Mostaza', 'Set de pollo frito coreano con arroz blanco y salsa miel y mostaza', 12.70, 'Otras del Mundo', 'Sets', true),
('Set Pollo Coreano con Arroz Japonés y Salsa Agridulce', 'Set de pollo frito coreano con arroz japonés y salsa agridulce', 12.70, 'Otras del Mundo', 'Sets', true),
('Set Pollo Coreano con Arroz Japonés y Salsa Yogur', 'Set de pollo frito coreano con arroz japonés y salsa yogur con queso', 12.70, 'Otras del Mundo', 'Sets', true),
('Set Pollo Coreano con Arroz Japonés y Salsa Miel Mostaza', 'Set de pollo frito coreano con arroz japonés y salsa miel y mostaza', 12.70, 'Otras del Mundo', 'Sets', true),
('Set Pollo Coreano con Patatas Fritas y Salsa Agridulce', 'Set de pollo frito coreano con patatas fritas y salsa agridulce', 12.70, 'Otras del Mundo', 'Sets', true),
('Set Pollo Coreano con Patatas Fritas y Salsa Yogur', 'Set de pollo frito coreano con patatas fritas y salsa yogur con queso', 12.70, 'Otras del Mundo', 'Sets', true),
('Set Pollo Coreano con Patatas Fritas y Salsa Miel Mostaza', 'Set de pollo frito coreano con patatas fritas y salsa miel y mostaza', 12.70, 'Otras del Mundo', 'Sets', true);

-- 4. Disable the old generic Set de Pollo Frito Coreano (now replaced by variants)
UPDATE products SET is_available = false WHERE id = 268;