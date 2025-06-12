
-- Agregar campo para rastrear quién creó cada operación
ALTER TABLE public.operations 
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Crear bucket de almacenamiento para fotos de operaciones
INSERT INTO storage.buckets (id, name, public) 
VALUES ('operation-photos', 'operation-photos', true);

-- Crear políticas para el bucket de fotos
CREATE POLICY "Cualquiera puede ver fotos de operaciones" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'operation-photos');

CREATE POLICY "Admins pueden subir fotos de operaciones" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'operation-photos' AND
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins pueden actualizar fotos de operaciones" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'operation-photos' AND
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins pueden eliminar fotos de operaciones" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'operation-photos' AND
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  )
);

-- Agregar campo para la URL de la foto en operaciones
ALTER TABLE public.operations 
ADD COLUMN photo_url TEXT;
