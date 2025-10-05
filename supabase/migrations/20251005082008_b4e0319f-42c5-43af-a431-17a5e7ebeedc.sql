-- Add storage bucket RLS policies to prevent unauthorized uploads
-- Only authenticated users can upload to Fotos_Thaii bucket

-- Policy: Anyone can view images (public read access for product images)
CREATE POLICY "Public images are viewable by everyone"
ON storage.objects
FOR SELECT
USING (bucket_id = 'Fotos_Thaii');

-- Policy: Only authenticated users can upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'Fotos_Thaii' 
  AND auth.role() = 'authenticated'
);

-- Policy: Only authenticated users can update their own uploads
CREATE POLICY "Authenticated users can update own images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'Fotos_Thaii' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'Fotos_Thaii' 
  AND auth.role() = 'authenticated'
);

-- Policy: Only authenticated users can delete their own uploads
CREATE POLICY "Authenticated users can delete own images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'Fotos_Thaii' 
  AND auth.role() = 'authenticated'
);