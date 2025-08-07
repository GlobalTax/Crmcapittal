-- FASE 1: ESTRUCTURA JERÁRQUICA & ORGANIZACIÓN

-- 1. Sistema de carpetas para organización jerárquica
CREATE TABLE public.document_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES public.document_folders(id) ON DELETE CASCADE,
  folder_type TEXT CHECK (folder_type IN ('client', 'project', 'general', 'template')) DEFAULT 'general',
  client_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id UUID, -- Para deals/mandatos/casos en el futuro
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Sistema de versionado de documentos
CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  changes_summary TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(document_id, version_number)
);

-- 3. Extender tabla documents con nuevos campos
ALTER TABLE public.documents 
ADD COLUMN folder_id UUID REFERENCES public.document_folders(id) ON DELETE SET NULL,
ADD COLUMN tags TEXT[] DEFAULT '{}',
ADD COLUMN auto_linked_entity_type TEXT,
ADD COLUMN auto_linked_entity_id UUID,
ADD COLUMN watermark_settings JSONB DEFAULT '{}',
ADD COLUMN expiration_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN current_version INTEGER DEFAULT 1;

-- 4. Índices para optimizar rendimiento
CREATE INDEX idx_document_folders_parent ON public.document_folders(parent_folder_id);
CREATE INDEX idx_document_folders_client ON public.document_folders(client_id);
CREATE INDEX idx_document_folders_created_by ON public.document_folders(created_by);
CREATE INDEX idx_documents_folder ON public.documents(folder_id);
CREATE INDEX idx_documents_tags ON public.documents USING gin(tags);
CREATE INDEX idx_document_versions_document ON public.document_versions(document_id);

-- 5. Función para actualizar updated_at en folders
CREATE OR REPLACE FUNCTION public.update_folder_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para updated_at en folders
CREATE TRIGGER update_document_folders_updated_at
  BEFORE UPDATE ON public.document_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_folder_updated_at();

-- 7. Función para crear nueva versión de documento
CREATE OR REPLACE FUNCTION public.create_document_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo crear versión si cambió el contenido
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO public.document_versions (
      document_id,
      version_number,
      title,
      content,
      changes_summary,
      created_by
    ) VALUES (
      NEW.id,
      NEW.current_version,
      NEW.title,
      NEW.content,
      'Actualización automática',
      NEW.created_by
    );
    
    -- Incrementar número de versión
    NEW.current_version = COALESCE(NEW.current_version, 1) + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para versionado automático
CREATE TRIGGER create_document_version_trigger
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.create_document_version();

-- 9. RLS Policies para document_folders
ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view folders they created or have access to"
ON public.document_folders FOR SELECT
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = document_folders.client_id 
    AND (c.created_by = auth.uid() OR c.owner_id = auth.uid())
  ) OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Users can create folders"
ON public.document_folders FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own folders"
ON public.document_folders FOR UPDATE
USING (
  created_by = auth.uid() OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Users can delete their own folders"
ON public.document_folders FOR DELETE
USING (
  created_by = auth.uid() OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- 10. RLS Policies para document_versions
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of documents they have access to"
ON public.document_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_versions.document_id
    AND (d.created_by = auth.uid() OR has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role))
  )
);

CREATE POLICY "System can create document versions"
ON public.document_versions FOR INSERT
WITH CHECK (true);

-- 11. Crear carpetas raíz por defecto
INSERT INTO public.document_folders (name, folder_type, created_by)
SELECT 'Documentos Generales', 'general', id
FROM auth.users
WHERE id IN (SELECT DISTINCT created_by FROM public.documents WHERE created_by IS NOT NULL)
ON CONFLICT DO NOTHING;

INSERT INTO public.document_folders (name, folder_type, created_by)
SELECT 'Plantillas', 'template', id
FROM auth.users
WHERE id IN (SELECT DISTINCT created_by FROM public.documents WHERE created_by IS NOT NULL)
ON CONFLICT DO NOTHING;