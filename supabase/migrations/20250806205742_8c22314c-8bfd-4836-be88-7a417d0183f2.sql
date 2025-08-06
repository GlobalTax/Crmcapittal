-- Crear tabla automation_logs para auditoría de automatizaciones
CREATE TABLE public.automation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_type TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'deal', 'negocio', etc.
  entity_id UUID NOT NULL,
  trigger_event TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  action_data JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'success', -- 'success', 'failed', 'pending'
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  execution_time_ms INTEGER,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Extender tabla task_notifications con campos para recordatorios programados
ALTER TABLE public.task_notifications 
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
ADD COLUMN IF NOT EXISTS reminder_type TEXT, -- 'nda_reminder', 'inactivity_reminder', 'proposal_reminder'
ADD COLUMN IF NOT EXISTS deal_id UUID,
ADD COLUMN IF NOT EXISTS negocio_id UUID;

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_automation_logs_entity ON public.automation_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_type ON public.automation_logs(automation_type);
CREATE INDEX IF NOT EXISTS idx_automation_logs_executed_at ON public.automation_logs(executed_at);

CREATE INDEX IF NOT EXISTS idx_task_notifications_scheduled ON public.task_notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_notifications_status ON public.task_notifications(status);
CREATE INDEX IF NOT EXISTS idx_task_notifications_reminder_type ON public.task_notifications(reminder_type);
CREATE INDEX IF NOT EXISTS idx_task_notifications_deal_id ON public.task_notifications(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_notifications_negocio_id ON public.task_notifications(negocio_id) WHERE negocio_id IS NOT NULL;

-- Políticas RLS para automation_logs
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own automation logs" 
ON public.automation_logs 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "System can insert automation logs" 
ON public.automation_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage automation logs" 
ON public.automation_logs 
FOR ALL 
USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Actualizar políticas RLS existentes de task_notifications para incluir nuevos campos
-- (Las políticas existentes ya cubren la funcionalidad base)

-- Función para crear logs de automatización de forma segura
CREATE OR REPLACE FUNCTION public.log_automation_event(
  p_automation_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_trigger_event TEXT,
  p_action_taken TEXT,
  p_action_data JSONB DEFAULT '{}'::jsonb,
  p_status TEXT DEFAULT 'success',
  p_error_message TEXT DEFAULT NULL,
  p_execution_time_ms INTEGER DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.automation_logs (
    automation_type,
    entity_type,
    entity_id,
    trigger_event,
    action_taken,
    action_data,
    status,
    error_message,
    execution_time_ms,
    user_id
  ) VALUES (
    p_automation_type,
    p_entity_type,
    p_entity_id,
    p_trigger_event,
    p_action_taken,
    p_action_data,
    p_status,
    p_error_message,
    p_execution_time_ms,
    auth.uid()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Función para obtener recordatorios programados pendientes
CREATE OR REPLACE FUNCTION public.get_pending_scheduled_reminders()
RETURNS TABLE(
  id UUID,
  task_id TEXT,
  task_type TEXT,
  notification_type TEXT,
  reminder_type TEXT,
  task_title TEXT,
  entity_name TEXT,
  entity_id TEXT,
  message TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  deal_id UUID,
  negocio_id UUID,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tn.id,
    tn.task_id,
    tn.task_type,
    tn.notification_type,
    tn.reminder_type,
    tn.task_title,
    tn.entity_name,
    tn.entity_id,
    tn.message,
    tn.scheduled_for,
    tn.deal_id,
    tn.negocio_id,
    tn.user_id,
    tn.created_at
  FROM public.task_notifications tn
  WHERE tn.scheduled_for IS NOT NULL
    AND tn.scheduled_for <= now()
    AND tn.status = 'pending'
    AND tn.read_at IS NULL
  ORDER BY tn.scheduled_for ASC;
END;
$$;

-- Función para marcar recordatorio como procesado
CREATE OR REPLACE FUNCTION public.mark_reminder_processed(
  p_reminder_id UUID,
  p_status TEXT DEFAULT 'sent',
  p_error_message TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.task_notifications 
  SET 
    status = p_status,
    updated_at = now(),
    -- Si es exitoso, marcarlo como no leído para que aparezca en notificaciones
    read_at = CASE WHEN p_status = 'sent' THEN NULL ELSE read_at END
  WHERE id = p_reminder_id;
  
  RETURN FOUND;
END;
$$;