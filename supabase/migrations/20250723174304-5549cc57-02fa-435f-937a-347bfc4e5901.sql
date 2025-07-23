
-- Añadir campo review_status a la tabla valoracion_documents
ALTER TABLE public.valoracion_documents 
ADD COLUMN review_status TEXT NOT NULL DEFAULT 'pending' 
CHECK (review_status IN ('pending', 'approved', 'rejected', 'under_review'));

-- Crear tabla para historial de revisión de documentos
CREATE TABLE public.valoracion_document_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.valoracion_documents(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en la nueva tabla
ALTER TABLE public.valoracion_document_reviews ENABLE ROW LEVEL SECURITY;

-- Política RLS para valoracion_document_reviews
CREATE POLICY "Admin users can manage document reviews"
  ON public.valoracion_document_reviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Crear índices para rendimiento
CREATE INDEX idx_valoracion_document_reviews_document_id ON public.valoracion_document_reviews(document_id);
CREATE INDEX idx_valoracion_document_reviews_status ON public.valoracion_document_reviews(new_status);

-- Trigger para actualizar updated_at en valoracion_documents
CREATE TRIGGER update_valoracion_document_reviews_updated_at
  BEFORE UPDATE ON public.valoracion_document_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
