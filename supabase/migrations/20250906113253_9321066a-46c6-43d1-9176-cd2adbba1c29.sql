-- Insert the remaining products to complete the 235 items menu

-- Continue with Tallarines Glass Original (50-56)
INSERT INTO public.products (id, name, description, price, category, subcategory, image_url, is_spicy) VALUES
(50, 'Tallarines Glass con pollo original', 'Tallarines de cristal salteados con pollo tierno preparado con nuestra receta original', 10.60, 'Tallarines', 'Glass Original', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/noodles-hero.jpg', false),
(51, 'Tallarines Glass con ternera original', 'Tallarines de cristal salteados con ternera jugosa preparado con nuestra receta original', 10.80, 'Tallarines', 'Glass Original', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/noodles-hero.jpg', false),

-- Tallarines Finos Classic (64-70)
(64, 'Tallarines Finos con pollo classic', 'Tallarines finos salteados con pollo tierno al estilo clásico', 10.60, 'Tallarines', 'Finos Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/noodles-hero.jpg', false),
(65, 'Tallarines Finos con ternera classic', 'Tallarines finos salteados con ternera jugosa al estilo clásico', 10.80, 'Tallarines', 'Finos Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/noodles-hero.jpg', false),

-- Tallarines Anchos Classic (85-91)
(85, 'Tallarines Anchos con pollo classic', 'Tallarines anchos salteados con pollo tierno al estilo clásico', 10.60, 'Tallarines', 'Anchos Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/noodles-hero.jpg', false),
(86, 'Tallarines Anchos con ternera classic', 'Tallarines anchos salteados con ternera jugosa al estilo clásico', 10.80, 'Tallarines', 'Anchos Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/noodles-hero.jpg', false),

-- Tallarines Udon Classic (106-112)
(106, 'Tallarines Udon con pollo classic', 'Tallarines udon japoneses con pollo tierno al estilo clásico', 10.60, 'Tallarines', 'Udon Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/noodles-hero.jpg', false),
(107, 'Tallarines Udon con ternera classic', 'Tallarines udon japoneses con ternera jugosa al estilo clásico', 10.80, 'Tallarines', 'Udon Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/noodles-hero.jpg', false),

-- Sopas Tom Yam (130-132)
(130, 'Sopa Tom Yam (Medio picante) con pollo', 'Tradicional sopa thai Tom Yam con pollo, ligeramente picante con hierbas aromáticas', 8.90, 'Sopas', 'Tom Yam', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/soup.jpg', true),
(131, 'Sopa Tom Yam (Medio picante) con langostino', 'Tradicional sopa thai Tom Yam con langostinos frescos, ligeramente picante', 9.40, 'Sopas', 'Tom Yam', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/soup.jpg', true),
(132, 'Sopa Tom Yam (Medio picante) Veggie', 'Tradicional sopa thai Tom Yam vegetariana con verduras frescas', 8.10, 'Sopas', 'Tom Yam', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/soup.jpg', true),

-- Sets de pollo coreano (133-138)
(133, 'Set de pollo frito coreano con arroz blanco-jazmin y salsa agridulce', 'Crujiente pollo frito coreano servido con arroz jazmín y deliciosa salsa agridulce', 12.70, 'Sets', 'Pollo Coreano', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg', false),
(134, 'Set de pollo frito coreano con arroz blanco-jazmin y salsa mostaza y miel', 'Crujiente pollo frito coreano servido con arroz jazmín y salsa de mostaza y miel', 12.70, 'Sets', 'Pollo Coreano', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg', false),

-- Especialidades (139-147)
(139, 'Arroz frito con curry', 'Arroz frito aromático con nuestra mezcla especial de especias curry', 8.50, 'Especialidades', 'Curry', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/curry.jpg', true),
(140, 'Pad Ka Prao veggie', 'Tradicional plato thai vegetariano con albahaca sagrada y verduras frescas', 13.50, 'Especialidades', 'Pad Ka Prao', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg', true),
(141, 'Pad Ka Prao con pollo', 'Tradicional plato thai con pollo, albahaca sagrada y chiles', 15.20, 'Especialidades', 'Pad Ka Prao', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg', true),

-- Tonkatsu (148-151)
(148, 'Tonkatsu con arroz frito con huevo y agridulce', 'Chuleta de cerdo empanada crujiente con arroz frito con huevo y salsa agridulce', 13.50, 'Especialidades', 'Tonkatsu', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg', false),
(149, 'Tonkatsu con arroz frito con huevo y barbacoa', 'Chuleta de cerdo empanada crujiente con arroz frito con huevo y salsa barbacoa', 13.50, 'Especialidades', 'Tonkatsu', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg', false),

-- Más ensaladas (154-175)
(154, 'Ensalada Cesar con langostino', 'Ensalada césar con langostinos frescos, lechuga crujiente y aderezo césar', 12.90, 'Ensaladas', 'Cesar', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/salad.jpg', false),
(155, 'Ensalada Cesar Mixta con pollo y langostino', 'Ensalada césar completa con pollo y langostinos, perfecta combinación', 14.40, 'Ensaladas', 'Cesar', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/salad.jpg', false),

(156, 'Ensalada Classic normal', 'Ensalada clásica con ingredientes frescos de temporada', 10.40, 'Ensaladas', 'Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/salad.jpg', false),
(157, 'Ensalada Classic con pollo', 'Ensalada clásica con pollo a la plancha y vegetales frescos', 11.40, 'Ensaladas', 'Classic', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/salad.jpg', false),

-- Pokes (184-189)
(184, 'Poke Coreano', 'Bowl hawaiano con influencias coreanas, arroz, pescado fresco y vegetales', 11.95, 'Especialidades', 'Poke', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/salad.jpg', false),
(185, 'Poke Japones', 'Bowl hawaiano estilo japonés con sashimi, arroz y algas', 14.95, 'Especialidades', 'Poke', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/salad.jpg', false),
(186, 'Poke Indonesia', 'Bowl hawaiano con sabores indonesios, especias exóticas y pescado fresco', 11.95, 'Especialidades', 'Poke', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/salad.jpg', false),

-- Entrantes (190-207)
(190, 'Panko pollo', 'Trozos de pollo empanados en panko, crujientes y dorados', 7.50, 'Entrantes', 'Panko', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg', false),
(191, 'Panko langostino', 'Langostinos empanados en panko, crujientes por fuera y tiernos por dentro', 8.65, 'Entrantes', 'Panko', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg', false),

(192, 'Pinchito de pollo (1 unidad)', 'Delicioso pinchito de pollo marinado a la plancha', 3.75, 'Entrantes', 'Pinchitos', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg', false),
(193, 'Pinchito de pollo (2 unidades)', 'Dos pinchitos de pollo marinado a la plancha', 6.50, 'Entrantes', 'Pinchitos', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg', false),

(200, 'Rollito de gambas (8 unidades)', 'Deliciosos rollitos crujientes rellenos de gambas frescas', 11.90, 'Entrantes', 'Rollitos', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg', false),
(201, 'Alitas (6 unidades)', 'Alitas de pollo marinadas y cocinadas a la perfección', 7.50, 'Entrantes', 'Alitas', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/fried-rice.jpg', false),

(206, 'Edamame', 'Vainas de soja cocidas al vapor con sal marina', 5.75, 'Entrantes', 'Edamame', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/salad.jpg', false),
(207, 'Edamame picante', 'Vainas de soja cocidas con especias picantes', 5.95, 'Entrantes', 'Edamame', 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/salad.jpg', true),

-- Más bebidas (210-235)
(210, 'Fanta Naranja', 'Refrescante Fanta sabor naranja 0.33L', 2.30, 'Bebidas', 'Refrescos', NULL, false),
(211, 'Fanta Limón', 'Refrescante Fanta sabor limón 0.33L', 2.30, 'Bebidas', 'Refrescos', NULL, false),
(212, 'Nestea Limón', 'Té helado sabor limón 0.33L', 2.30, 'Bebidas', 'Refrescos', NULL, false),
(213, 'Nestea Maracuyá', 'Té helado sabor maracuyá 0.33L', 2.30, 'Bebidas', 'Refrescos', NULL, false),

(218, 'Agua con gas', 'Agua con gas natural 0.33L', 2.30, 'Bebidas', 'Agua', NULL, false),
(219, 'Zumo manzana', 'Zumo natural de manzana 0.200L', 2.50, 'Bebidas', 'Zumos', NULL, false),
(220, 'Zumo piña', 'Zumo natural de piña 0.200L', 2.50, 'Bebidas', 'Zumos', NULL, false),
(221, 'Zumo naranja', 'Zumo natural de naranja 0.200L', 2.50, 'Bebidas', 'Zumos', NULL, false),

(225, 'Cerveza kirin(1/3)', 'Cerveza japonesa Kirin 1/3', 3.50, 'Bebidas', 'Cerveza', NULL, false),
(226, 'Cerveza San Miguel especial (1/3)', 'Cerveza San Miguel especial 1/3', 2.80, 'Bebidas', 'Cerveza', NULL, false),
(227, 'Cerveza San Miguel sin gluten (1/3)', 'Cerveza San Miguel sin gluten 1/3', 3.70, 'Bebidas', 'Cerveza', NULL, false),

(234, 'Botella de vino', 'Botella de vino de la casa', 15.00, 'Bebidas', 'Vino', NULL, false),
(235, 'Tinto de verano', 'Refrescante tinto de verano', 3.50, 'Bebidas', 'Vino', NULL, false)

ON CONFLICT (id) DO NOTHING;