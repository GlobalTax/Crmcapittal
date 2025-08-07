-- Tabla para plantillas de email
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('proposal_send', 'follow_up', 'reminder', 'thank_you', 'custom')),
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para reglas de automatización
CREATE TABLE public.automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('proposal_sent', 'proposal_viewed', 'no_response', 'time_based', 'manual')),
  trigger_config JSONB DEFAULT '{}',
  conditions JSONB DEFAULT '[]',
  actions JSONB DEFAULT '[]',
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para seguimientos automáticos
CREATE TABLE public.automated_followups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.automation_rules(id),
  template_id UUID REFERENCES public.email_templates(id),
  recipient_email TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'cancelled')),
  subject TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para notificaciones del sistema
CREATE TABLE public.system_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('proposal_viewed', 'follow_up_sent', 'response_received', 'deadline_approaching', 'automation_failed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para integraciones CRM
CREATE TABLE public.crm_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  provider TEXT NOT NULL CHECK (provider IN ('hubspot', 'salesforce', 'pipedrive', 'zoho', 'custom')),
  name TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error', 'success')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_email_templates_type ON public.email_templates(template_type);
CREATE INDEX idx_automation_rules_trigger ON public.automation_rules(trigger_type);
CREATE INDEX idx_automated_followups_scheduled ON public.automated_followups(scheduled_for);
CREATE INDEX idx_automated_followups_status ON public.automated_followups(status);
CREATE INDEX idx_system_notifications_user ON public.system_notifications(user_id);
CREATE INDEX idx_system_notifications_read ON public.system_notifications(read);
CREATE INDEX idx_crm_integrations_user ON public.crm_integrations(user_id);

-- Triggers para updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_automated_followups_updated_at
  BEFORE UPDATE ON public.automated_followups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_crm_integrations_updated_at
  BEFORE UPDATE ON public.crm_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_integrations ENABLE ROW LEVEL SECURITY;

-- Policies para email_templates
CREATE POLICY "Users can manage their email templates" ON public.email_templates
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Users can view active templates" ON public.email_templates
  FOR SELECT USING (is_active = true OR created_by = auth.uid());

-- Policies para automation_rules
CREATE POLICY "Users can manage their automation rules" ON public.automation_rules
  FOR ALL USING (created_by = auth.uid());

-- Policies para automated_followups
CREATE POLICY "Users can manage followups for their proposals" ON public.automated_followups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE id = proposal_id AND created_by = auth.uid()
    )
  );

-- Policies para system_notifications
CREATE POLICY "Users can view their notifications" ON public.system_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.system_notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.system_notifications
  FOR INSERT WITH CHECK (true);

-- Policies para crm_integrations
CREATE POLICY "Users can manage their CRM integrations" ON public.crm_integrations
  FOR ALL USING (user_id = auth.uid());

-- Función para procesar automatizaciones
CREATE OR REPLACE FUNCTION process_automation_triggers()
RETURNS void AS $$
DECLARE
  automation_record RECORD;
  followup_record RECORD;
BEGIN
  -- Procesar seguimientos programados que ya deben enviarse
  FOR followup_record IN 
    SELECT * FROM public.automated_followups 
    WHERE status = 'scheduled' 
    AND scheduled_for <= now()
  LOOP
    -- Marcar como enviado (aquí se integraría con el servicio de email)
    UPDATE public.automated_followups 
    SET 
      status = 'sent',
      sent_at = now(),
      updated_at = now()
    WHERE id = followup_record.id;
    
    -- Crear notificación
    INSERT INTO public.system_notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      followup_record.created_by,
      'follow_up_sent',
      'Seguimiento automático enviado',
      'Se ha enviado un seguimiento automático para la propuesta',
      jsonb_build_object('followup_id', followup_record.id, 'proposal_id', followup_record.proposal_id)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insertar plantillas predeterminadas
INSERT INTO public.email_templates (name, subject, content, template_type, variables, created_by) VALUES
('Envío de Propuesta', 'Su propuesta comercial - {{company_name}}', 
'<p>Estimado/a {{contact_name}},</p>
<p>Adjunto encontrará nuestra propuesta comercial para {{project_name}}.</p>
<p>La propuesta incluye:</p>
<ul>
<li>Análisis detallado de sus necesidades</li>
<li>Solución propuesta</li>
<li>Cronograma de implementación</li>
<li>Inversión requerida</li>
</ul>
<p>Quedamos a su disposición para cualquier consulta.</p>
<p>Saludos cordiales,<br>{{sender_name}}</p>', 
'proposal_send', 
'["company_name", "contact_name", "project_name", "sender_name"]'::jsonb,
(SELECT id FROM auth.users LIMIT 1)),

('Seguimiento Primera Semana', 'Seguimiento - Propuesta {{company_name}}', 
'<p>Estimado/a {{contact_name}},</p>
<p>Espero que se encuentre bien. Le escribo para hacer seguimiento de la propuesta que le enviamos la semana pasada.</p>
<p>¿Ha tenido oportunidad de revisar nuestra propuesta? ¿Tiene alguna pregunta o necesita aclaraciones adicionales?</p>
<p>Estamos disponibles para una reunión cuando le resulte conveniente.</p>
<p>Saludos cordiales,<br>{{sender_name}}</p>', 
'follow_up', 
'["company_name", "contact_name", "sender_name"]'::jsonb,
(SELECT id FROM auth.users LIMIT 1)),

('Recordatorio Deadline', 'Recordatorio - Validez de propuesta {{company_name}}', 
'<p>Estimado/a {{contact_name}},</p>
<p>Le recordamos que la validez de nuestra propuesta vence el {{deadline_date}}.</p>
<p>Si necesita más tiempo o tiene consultas, no dude en contactarnos.</p>
<p>Saludos cordiales,<br>{{sender_name}}</p>', 
'reminder', 
'["company_name", "contact_name", "deadline_date", "sender_name"]'::jsonb,
(SELECT id FROM auth.users LIMIT 1));

-- Insertar reglas de automatización predeterminadas
INSERT INTO public.automation_rules (name, description, trigger_type, trigger_config, conditions, actions, created_by) VALUES
('Seguimiento automático 7 días', 
'Envía un seguimiento automático 7 días después de enviar la propuesta si no hay respuesta',
'time_based',
'{"delay_days": 7}'::jsonb,
'[{"type": "no_response", "value": true}]'::jsonb,
'[{"type": "send_email", "template": "follow_up"}]'::jsonb,
(SELECT id FROM auth.users LIMIT 1)),

('Recordatorio deadline 3 días', 
'Envía recordatorio 3 días antes del vencimiento de la propuesta',
'time_based',
'{"before_deadline_days": 3}'::jsonb,
'[{"type": "proposal_active", "value": true}]'::jsonb,
'[{"type": "send_email", "template": "reminder"}]'::jsonb,
(SELECT id FROM auth.users LIMIT 1));