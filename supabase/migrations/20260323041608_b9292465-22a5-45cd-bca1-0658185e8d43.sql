
-- Entrantes
UPDATE products SET video_url = 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/alitas-video.mp4' WHERE id = 201;
UPDATE products SET video_url = 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/bao-langostino-video.mp4' WHERE id = 205;
UPDATE products SET video_url = 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/bao-pollo-video.mp4' WHERE id = 204;
UPDATE products SET video_url = 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/edamame-video.mp4' WHERE id IN (206, 207);
UPDATE products SET video_url = 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/gyozas-video.mp4' WHERE id IN (202, 203);
UPDATE products SET video_url = 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/panko-langostinos.mp4' WHERE id = 191;
UPDATE products SET video_url = 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/panko-pollo-video.mp4' WHERE id = 190;
UPDATE products SET video_url = 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/Salmon-video.mp4' WHERE id = 198;
UPDATE products SET video_url = 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/pinchito-gambas-video.mp4' WHERE id IN (194, 195);
UPDATE products SET video_url = 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/panko-pollo-video.mp4' WHERE id IN (192, 193);
UPDATE products SET video_url = 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/rollito-gambas-video.mp4' WHERE id = 200;
UPDATE products SET video_url = 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/rollito-primavera-video.mp4' WHERE id = 199;

-- Arroces - todos con el mismo vídeo
UPDATE products SET video_url = 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/arroz-video.mp4' WHERE category = 'Arroces';

-- Tallarines Anchos
UPDATE products SET video_url = 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/padthaii-video.mp4' WHERE category = 'Tallarines' AND subcategory = 'Anchos';

-- Tallarines Udon
UPDATE products SET video_url = 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/udon-video.mp4' WHERE category = 'Tallarines' AND subcategory = 'Udon';

-- Sopas Miso
UPDATE products SET video_url = 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/sopa-miso-video.mp4' WHERE category = 'Sopas' AND subcategory = 'Miso';

-- Sopas Tom Yam
UPDATE products SET video_url = 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/sopa-tomyam-video.mp4' WHERE category = 'Sopas' AND subcategory = 'Tom Yam';
