
-- Crear tabla para historial de notificaciones de reconversiones
CREATE TABLE public.reconversion_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reconversion_id UUID REFERENCES public.reconversiones(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('reconversion_created', 'candidate_added', 'reconversion_closed', 'data_missing')),
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_email TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_in_app BOOLEAN DEFAULT false,
  sent_email BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.reconversion_notifications ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios vean sus propias notificaciones
CREATE POLICY "Users can view their own reconversion notifications" 
  ON public.reconversion_notifications 
  FOR SELECT 
  USING (auth.uid() = recipient_user_id);

-- Política para que los admins puedan ver todas las notificaciones
CREATE POLICY "Admins can view all reconversion notifications" 
  ON public.reconversion_notifications 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Función para enviar notificaciones de reconversión
CREATE OR REPLACE FUNCTION public.send_reconversion_notification(
  p_reconversion_id UUID,
  p_notification_type TEXT,
  p_recipient_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  notification_id UUID;
  recipient_email TEXT;
BEGIN
  -- Obtener email del destinatario
  SELECT email INTO recipient_email
  FROM auth.users
  WHERE id = p_recipient_user_id;
  
  IF recipient_email IS NULL THEN
    RAISE EXCEPTION 'Recipient user not found';
  END IF;
  
  -- Insertar notificación
  INSERT INTO public.reconversion_notifications (
    reconversion_id,
    notification_type,
    recipient_user_id,
    recipient_email,
    title,
    message,
    sent_in_app,
    metadata
  ) VALUES (
    p_reconversion_id,
    p_notification_type,
    p_recipient_user_id,
    recipient_email,
    p_title,
    p_message,
    true,
    p_metadata
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Trigger para notificaciones automáticas en reconversiones
CREATE OR REPLACE FUNCTION public.trigger_reconversion_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  assigned_user_id UUID;
  creator_user_id UUID;
  reconversion_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notificación de reconversión creada
    reconversion_name := NEW.company_name || ' - ' || LEFT(NEW.rejection_reason, 50);
    
    -- Notificar al asignado si existe
    IF NEW.assigned_to IS NOT NULL THEN
      PERFORM public.send_reconversion_notification(
        NEW.id,
        'reconversion_created',
        NEW.assigned_to,
        'Nueva Reconversión Asignada',
        'Se te ha asignado una nueva reconversión: ' || reconversion_name,
        jsonb_build_object('company_name', NEW.company_name, 'priority', NEW.priority)
      );
    END IF;
    
    -- Notificar a admins si no hay asignado
    IF NEW.assigned_to IS NULL THEN
      INSERT INTO public.reconversion_notifications (
        reconversion_id, notification_type, recipient_user_id, recipient_email, title, message, sent_in_app, metadata
      )
      SELECT 
        NEW.id,
        'reconversion_created',
        ur.user_id,
        au.email,
        'Nueva Reconversión Sin Asignar',
        'Nueva reconversión creada sin asignar: ' || reconversion_name,
        true,
        jsonb_build_object('company_name', NEW.company_name, 'priority', NEW.priority, 'needs_assignment', true)
      FROM public.user_roles ur
      JOIN auth.users au ON ur.user_id = au.id
      WHERE ur.role IN ('admin', 'superadmin');
    END IF;
    
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    -- Notificación de reconversión cerrada
    IF OLD.status != NEW.status AND NEW.status = 'closed' THEN
      reconversion_name := NEW.company_name || ' - Cerrada';
      
      -- Notificar al asignado y creador
      IF NEW.assigned_to IS NOT NULL THEN
        PERFORM public.send_reconversion_notification(
          NEW.id,
          'reconversion_closed',
          NEW.assigned_to,
          'Reconversión Cerrada',
          'La reconversión ha sido cerrada: ' || reconversion_name,
          jsonb_build_object('company_name', NEW.company_name, 'final_status', NEW.status)
        );
      END IF;
      
      IF NEW.created_by IS NOT NULL AND NEW.created_by != NEW.assigned_to THEN
        PERFORM public.send_reconversion_notification(
          NEW.id,
          'reconversion_closed',
          NEW.created_by,
          'Reconversión Cerrada',
          'Tu reconversión ha sido cerrada: ' || reconversion_name,
          jsonb_build_object('company_name', NEW.company_name, 'final_status', NEW.status)
        );
      END IF;
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Crear trigger para reconversiones
CREATE TRIGGER reconversion_notifications_trigger
  AFTER INSERT OR UPDATE ON public.reconversiones
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_reconversion_notifications();

-- Índices para mejorar rendimiento
CREATE INDEX idx_reconversion_notifications_recipient ON public.reconversion_notifications(recipient_user_id);
CREATE INDEX idx_reconversion_notifications_type ON public.reconversion_notifications(notification_type);
CREATE INDEX idx_reconversion_notifications_reconversion ON public.reconversion_notifications(reconversion_id);
