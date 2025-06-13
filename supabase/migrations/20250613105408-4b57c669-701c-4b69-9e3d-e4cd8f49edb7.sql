
-- Crear el bucket 'teasers' para almacenar archivos teaser
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit) 
VALUES (
  'teasers', 
  'teasers', 
  true, 
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  10485760  -- 10MB limit
);

-- Crear políticas para el bucket de teasers
CREATE POLICY "Cualquiera puede ver teasers" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'teasers');

CREATE POLICY "Usuarios autenticados pueden subir teasers" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'teasers' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Usuarios autenticados pueden actualizar teasers" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'teasers' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Usuarios autenticados pueden eliminar teasers" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'teasers' AND
  auth.uid() IS NOT NULL
);
