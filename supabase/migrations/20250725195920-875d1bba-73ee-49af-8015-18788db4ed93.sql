-- Crear bucket de storage temporal para archivos Excel
INSERT INTO storage.buckets (id, name, public) 
VALUES ('excel-temp', 'excel-temp', false);

-- Políticas para el bucket de archivos temporales
CREATE POLICY "Usuarios pueden subir archivos temporales"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'excel-temp' AND auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios pueden leer sus archivos temporales"
ON storage.objects
FOR SELECT
USING (bucket_id = 'excel-temp' AND auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios pueden eliminar sus archivos temporales"
ON storage.objects
FOR DELETE
USING (bucket_id = 'excel-temp' AND auth.uid() IS NOT NULL);