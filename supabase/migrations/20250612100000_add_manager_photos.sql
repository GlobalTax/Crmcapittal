
-- Crear bucket para fotos de gestores
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'manager-photos',
  'manager-photos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Añadir campo photo a operation_managers si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'operation_managers' 
    AND column_name = 'photo'
  ) THEN
    ALTER TABLE operation_managers ADD COLUMN photo TEXT;
  END IF;
END $$;

-- Política para permitir lectura pública de las fotos
CREATE POLICY "Public read access for manager photos" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'manager-photos');

-- Política para permitir subida y actualización de fotos (autenticados)
CREATE POLICY "Authenticated users can upload manager photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'manager-photos');

CREATE POLICY "Authenticated users can update manager photos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'manager-photos');

CREATE POLICY "Authenticated users can delete manager photos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'manager-photos');
