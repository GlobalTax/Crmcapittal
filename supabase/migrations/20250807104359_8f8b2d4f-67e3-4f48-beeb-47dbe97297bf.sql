-- Phase 3: Real-Time Collaboration
-- Comentarios en documentos
CREATE TABLE public.document_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position_data JSONB DEFAULT NULL, -- Para posición en el documento
  thread_id UUID REFERENCES public.document_comments(id) ON DELETE CASCADE, -- Para hilos de respuestas
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Menciones en comentarios
CREATE TABLE public.document_mentions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.document_comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Presencia colaborativa
CREATE TABLE public.document_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  cursor_position JSONB DEFAULT NULL,
  selection_data JSONB DEFAULT NULL,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(document_id, user_id)
);

-- Notificaciones del sistema
CREATE TABLE public.document_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.document_comments(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('comment', 'mention', 'permission_granted', 'document_shared')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para optimización
CREATE INDEX idx_document_comments_document_id ON public.document_comments(document_id);
CREATE INDEX idx_document_comments_thread_id ON public.document_comments(thread_id);
CREATE INDEX idx_document_comments_created_by ON public.document_comments(created_by);
CREATE INDEX idx_document_mentions_comment_id ON public.document_mentions(comment_id);
CREATE INDEX idx_document_mentions_user_id ON public.document_mentions(mentioned_user_id);
CREATE INDEX idx_document_presence_document_id ON public.document_presence(document_id);
CREATE INDEX idx_document_presence_user_id ON public.document_presence(user_id);
CREATE INDEX idx_document_notifications_user_id ON public.document_notifications(user_id);
CREATE INDEX idx_document_notifications_read ON public.document_notifications(read);

-- RLS Policies para comentarios
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on documents they have access to" 
ON public.document_comments FOR SELECT 
USING (
  public.check_document_permission(document_id, auth.uid(), 'view')
);

CREATE POLICY "Users can create comments on documents they have access to" 
ON public.document_comments FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND 
  public.check_document_permission(document_id, auth.uid(), 'comment')
);

CREATE POLICY "Users can update their own comments" 
ON public.document_comments FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Comment creators and document owners can delete comments" 
ON public.document_comments FOR DELETE 
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM documents 
    WHERE id = document_comments.document_id AND created_by = auth.uid()
  )
);

-- RLS Policies para menciones
ALTER TABLE public.document_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mentions in accessible documents" 
ON public.document_mentions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM document_comments dc 
    WHERE dc.id = comment_id AND 
    public.check_document_permission(dc.document_id, auth.uid(), 'view')
  )
);

CREATE POLICY "Users can create mentions in their comments" 
ON public.document_mentions FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM document_comments dc 
    WHERE dc.id = comment_id AND dc.created_by = auth.uid()
  )
);

-- RLS Policies para presencia
ALTER TABLE public.document_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view presence on documents they have access to" 
ON public.document_presence FOR SELECT 
USING (
  public.check_document_permission(document_id, auth.uid(), 'view')
);

CREATE POLICY "Users can manage their own presence" 
ON public.document_presence FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies para notificaciones
ALTER TABLE public.document_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
ON public.document_notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.document_notifications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.document_notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Triggers para timestamps
CREATE TRIGGER update_document_comments_updated_at
  BEFORE UPDATE ON public.document_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_presence_last_seen
  BEFORE UPDATE ON public.document_presence
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para crear notificaciones automáticas
CREATE OR REPLACE FUNCTION public.create_comment_notifications()
RETURNS TRIGGER AS $$
DECLARE
  doc_owner_id UUID;
  mention_user_id UUID;
BEGIN
  -- Notificar al dueño del documento si no es quien comentó
  SELECT created_by INTO doc_owner_id 
  FROM documents 
  WHERE id = NEW.document_id;
  
  IF doc_owner_id != NEW.created_by THEN
    INSERT INTO public.document_notifications (
      user_id, document_id, comment_id, notification_type, title, message
    ) VALUES (
      doc_owner_id, 
      NEW.document_id, 
      NEW.id, 
      'comment',
      'Nuevo comentario en documento',
      'Se ha añadido un nuevo comentario en tu documento'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER comment_notifications_trigger
  AFTER INSERT ON public.document_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_comment_notifications();

-- Función para crear notificaciones de menciones
CREATE OR REPLACE FUNCTION public.create_mention_notifications()
RETURNS TRIGGER AS $$
DECLARE
  doc_id UUID;
  comment_content TEXT;
BEGIN
  -- Obtener información del comentario
  SELECT document_id, content INTO doc_id, comment_content
  FROM document_comments 
  WHERE id = NEW.comment_id;
  
  -- Crear notificación de mención
  INSERT INTO public.document_notifications (
    user_id, document_id, comment_id, notification_type, title, message
  ) VALUES (
    NEW.mentioned_user_id,
    doc_id,
    NEW.comment_id,
    'mention',
    'Te han mencionado en un comentario',
    'Has sido mencionado en un comentario de documento'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER mention_notifications_trigger
  AFTER INSERT ON public.document_mentions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_mention_notifications();

-- Función para limpiar presencia antigua
CREATE OR REPLACE FUNCTION public.cleanup_old_presence()
RETURNS void AS $$
BEGIN
  DELETE FROM public.document_presence 
  WHERE last_seen < now() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar realtime para colaboración
ALTER TABLE public.document_comments REPLICA IDENTITY FULL;
ALTER TABLE public.document_mentions REPLICA IDENTITY FULL;
ALTER TABLE public.document_presence REPLICA IDENTITY FULL;
ALTER TABLE public.document_notifications REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.document_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_mentions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_notifications;