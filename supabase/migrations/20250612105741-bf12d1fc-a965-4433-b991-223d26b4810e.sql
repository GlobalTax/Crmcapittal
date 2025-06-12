
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

-- Crear bucket para fotos de gestores si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'manager-photos',
  'manager-photos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Políticas para el bucket de fotos de gestores
DO $$
BEGIN
  -- Política para lectura pública
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public read access for manager photos'
  ) THEN
    CREATE POLICY "Public read access for manager photos" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'manager-photos');
  END IF;

  -- Política para subida autenticada
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can upload manager photos'
  ) THEN
    CREATE POLICY "Authenticated users can upload manager photos" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'manager-photos');
  END IF;

  -- Política para actualización autenticada
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can update manager photos'
  ) THEN
    CREATE POLICY "Authenticated users can update manager photos" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'manager-photos');
  END IF;

  -- Política para eliminación autenticada
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can delete manager photos'
  ) THEN
    CREATE POLICY "Authenticated users can delete manager photos" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'manager-photos');
  END IF;
END $$;
