
-- Crear tabla para comentarios de valoraciones
CREATE TABLE public.valoracion_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  valoracion_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  comment_text TEXT NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'note' CHECK (comment_type IN ('note', 'status_change', 'phase_change', 'approval', 'rejection', 'document_update', 'assignment')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.valoracion_comments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para valoracion_comments
CREATE POLICY "Users can view comments on valoraciones they have access to"
  ON public.valoracion_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.valoraciones v
      WHERE v.id = valoracion_comments.valoracion_id
      AND (
        v.assigned_to = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid() 
          AND ur.role IN ('admin', 'superadmin')
        )
      )
    )
  );

CREATE POLICY "Users can create comments on valoraciones they have access to"
  ON public.valoracion_comments
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.valoraciones v
      WHERE v.id = valoracion_comments.valoracion_id
      AND (
        v.assigned_to = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid() 
          AND ur.role IN ('admin', 'superadmin')
        )
      )
    )
  );

CREATE POLICY "Users can update their own comments"
  ON public.valoracion_comments
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admin users can delete comments"
  ON public.valoracion_comments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Crear índices para rendimiento
CREATE INDEX idx_valoracion_comments_valoracion_id ON public.valoracion_comments(valoracion_id);
CREATE INDEX idx_valoracion_comments_user_id ON public.valoracion_comments(user_id);
CREATE INDEX idx_valoracion_comments_type ON public.valoracion_comments(comment_type);
CREATE INDEX idx_valoracion_comments_created_at ON public.valoracion_comments(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_valoracion_comments_updated_at
  BEFORE UPDATE ON public.valoracion_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
