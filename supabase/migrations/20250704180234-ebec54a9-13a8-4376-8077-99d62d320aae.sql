-- Crear bucket para archivos de contactos
INSERT INTO storage.buckets (id, name, public) VALUES ('contact-files', 'contact-files', true);

-- Tabla de archivos colaborativos asociados a contactos
CREATE TABLE IF NOT EXISTS contact_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  content_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_contact_files_contact_id ON contact_files(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_files_uploaded_by ON contact_files(uploaded_by);

-- Habilitar RLS
ALTER TABLE contact_files ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para colaboración
CREATE POLICY "Colaboradores pueden ver archivos de contactos" ON contact_files
  FOR SELECT USING (
    auth.uid() = uploaded_by OR 
    EXISTS (SELECT 1 FROM contacts WHERE contacts.id = contact_files.contact_id AND contacts.created_by = auth.uid())
  );

CREATE POLICY "Colaboradores pueden insertar archivos" ON contact_files
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by
  );

CREATE POLICY "Colaboradores pueden eliminar archivos" ON contact_files
  FOR DELETE USING (
    auth.uid() = uploaded_by
  );

-- Políticas de Storage para archivos de contactos
CREATE POLICY "Archivos de contactos son públicamente visibles" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'contact-files');

CREATE POLICY "Usuarios pueden subir archivos de contactos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'contact-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuarios pueden eliminar sus archivos de contactos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'contact-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_contact_file_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_file_updated_at
  BEFORE UPDATE ON contact_files
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_file_updated_at();