
-- Crear tabla para documentos de valoración
CREATE TABLE public.valoracion_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  valoracion_id UUID NOT NULL REFERENCES public.valoraciones(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  content_type TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('deliverable', 'internal')),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para logs de seguridad de valoración
CREATE TABLE public.valoracion_security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  valoracion_id UUID NOT NULL REFERENCES public.valoraciones(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear bucket de storage para documentos de valoración
INSERT INTO storage.buckets (id, name, public)
VALUES ('valoracion-documents', 'valoracion-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.valoracion_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valoracion_security_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para valoracion_documents
CREATE POLICY "Admin users can manage valoracion documents"
  ON public.valoracion_documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Políticas RLS para valoracion_security_logs
CREATE POLICY "Admin users can view valoracion security logs"
  ON public.valoracion_security_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "System can insert valoracion security logs"
  ON public.valoracion_security_logs
  FOR INSERT
  WITH CHECK (true);

-- Políticas de storage para el bucket
CREATE POLICY "Admin users can upload valoracion documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'valoracion-documents' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admin users can view valoracion documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'valoracion-documents' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admin users can delete valoracion documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'valoracion-documents' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Crear índices para rendimiento
CREATE INDEX idx_valoracion_documents_valoracion_id ON public.valoracion_documents(valoracion_id);
CREATE INDEX idx_valoracion_documents_document_type ON public.valoracion_documents(document_type);
CREATE INDEX idx_valoracion_security_logs_valoracion_id ON public.valoracion_security_logs(valoracion_id);
CREATE INDEX idx_valoracion_security_logs_action ON public.valoracion_security_logs(action);

-- Trigger para updated_at en valoracion_documents
CREATE TRIGGER update_valoracion_documents_updated_at
  BEFORE UPDATE ON public.valoracion_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
