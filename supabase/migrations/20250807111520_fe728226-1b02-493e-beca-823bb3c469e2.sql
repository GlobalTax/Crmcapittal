-- Crear tablas para el sistema de email integrado con CRM

-- Tabla para cuentas de email configuradas
CREATE TABLE public.email_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_address TEXT NOT NULL,
  display_name TEXT,
  provider TEXT NOT NULL DEFAULT 'smtp', -- smtp, imap, outlook, gmail
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_username TEXT,
  smtp_password TEXT, -- Encrypted
  imap_host TEXT,
  imap_port INTEGER DEFAULT 993,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending', -- pending, syncing, success, error
  sync_error TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para emails recibidos/enviados
CREATE TABLE public.emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL,
  message_id TEXT NOT NULL, -- Email Message-ID header
  thread_id TEXT, -- For threading conversations
  subject TEXT,
  sender_email TEXT NOT NULL,
  sender_name TEXT,
  recipient_emails TEXT[] NOT NULL DEFAULT '{}',
  cc_emails TEXT[] DEFAULT '{}',
  bcc_emails TEXT[] DEFAULT '{}',
  body_text TEXT,
  body_html TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')), 
  status TEXT DEFAULT 'sent', -- draft, sent, delivered, opened, clicked, replied, bounced
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  has_attachments BOOLEAN DEFAULT false,
  email_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- CRM Integration
  contact_id UUID,
  lead_id UUID,
  deal_id UUID,
  company_id UUID,
  
  -- Tracking
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  tracking_pixel_url TEXT,
  
  -- Templates & Automation
  template_id UUID,
  sequence_id UUID,
  sequence_step INTEGER,
  
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para templates de email
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  category TEXT DEFAULT 'general', -- general, follow_up, proposal, closing, welcome
  language TEXT DEFAULT 'es',
  variables JSONB DEFAULT '[]', -- Array of merge field variables
  is_shared BOOLEAN DEFAULT false, -- Team shared template
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  team_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para secuencias de email automatizadas
CREATE TABLE public.email_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'manual', -- manual, lead_created, deal_stage, time_based
  trigger_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  total_steps INTEGER DEFAULT 1,
  success_rate NUMERIC DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para pasos de secuencias
CREATE TABLE public.email_sequence_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL,
  step_number INTEGER NOT NULL,
  template_id UUID NOT NULL,
  delay_days INTEGER DEFAULT 0,
  delay_hours INTEGER DEFAULT 0,
  conditions JSONB DEFAULT '{}', -- Conditions to send this step
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sequence_id, step_number)
);

-- Tabla para tracking de aberturas/clicks
CREATE TABLE public.email_tracking_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('opened', 'clicked', 'replied', 'bounced', 'unsubscribed')),
  event_data JSONB DEFAULT '{}', -- URL clicked, user agent, etc.
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para conversaciones/hilos
CREATE TABLE public.email_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id TEXT NOT NULL UNIQUE,
  subject TEXT,
  participants TEXT[] NOT NULL DEFAULT '{}',
  last_email_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER DEFAULT 0,
  is_read BOOLEAN DEFAULT false,
  
  -- CRM Links
  contact_id UUID,
  lead_id UUID,
  deal_id UUID,
  company_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para configuraciones de email por usuario
CREATE TABLE public.email_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  signature_html TEXT,
  signature_text TEXT,
  auto_reply_enabled BOOLEAN DEFAULT false,
  auto_reply_message TEXT,
  tracking_enabled BOOLEAN DEFAULT true,
  sync_frequency INTEGER DEFAULT 15, -- minutes
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para métricas y analytics
CREATE TABLE public.email_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID,
  template_id UUID,
  sequence_id UUID,
  user_id UUID,
  metric_type TEXT NOT NULL, -- sent, opened, clicked, replied, bounced
  metric_value NUMERIC DEFAULT 1,
  date_bucket DATE NOT NULL, -- For daily aggregation
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_emails_account_id ON emails(account_id);
CREATE INDEX idx_emails_thread_id ON emails(thread_id);
CREATE INDEX idx_emails_contact_id ON emails(contact_id);
CREATE INDEX idx_emails_lead_id ON emails(lead_id);
CREATE INDEX idx_emails_direction_status ON emails(direction, status);
CREATE INDEX idx_emails_email_date ON emails(email_date DESC);
CREATE INDEX idx_email_tracking_events_email_id ON email_tracking_events(email_id);
CREATE INDEX idx_email_conversations_thread_id ON email_conversations(thread_id);
CREATE INDEX idx_email_analytics_date_bucket ON email_analytics(date_bucket);

-- Configurar foreign keys
ALTER TABLE emails ADD CONSTRAINT fk_emails_account_id FOREIGN KEY (account_id) REFERENCES email_accounts(id) ON DELETE CASCADE;
ALTER TABLE emails ADD CONSTRAINT fk_emails_template_id FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE SET NULL;
ALTER TABLE emails ADD CONSTRAINT fk_emails_sequence_id FOREIGN KEY (sequence_id) REFERENCES email_sequences(id) ON DELETE SET NULL;
ALTER TABLE email_sequence_steps ADD CONSTRAINT fk_sequence_steps_sequence_id FOREIGN KEY (sequence_id) REFERENCES email_sequences(id) ON DELETE CASCADE;
ALTER TABLE email_sequence_steps ADD CONSTRAINT fk_sequence_steps_template_id FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE CASCADE;
ALTER TABLE email_tracking_events ADD CONSTRAINT fk_tracking_events_email_id FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE;

-- Habilitar RLS
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analytics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para email_accounts
CREATE POLICY "Users can manage their own email accounts"
ON email_accounts FOR ALL
USING (user_id = auth.uid());

-- Políticas RLS para emails
CREATE POLICY "Users can access emails from their accounts"
ON emails FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM email_accounts ea 
    WHERE ea.id = emails.account_id AND ea.user_id = auth.uid()
  ) OR 
  created_by = auth.uid()
);

-- Políticas RLS para email_templates
CREATE POLICY "Users can access their own templates or shared ones"
ON email_templates FOR SELECT
USING (created_by = auth.uid() OR is_shared = true);

CREATE POLICY "Users can manage their own templates"
ON email_templates FOR INSERT, UPDATE, DELETE
USING (created_by = auth.uid());

-- Políticas RLS para email_sequences
CREATE POLICY "Users can manage their own sequences"
ON email_sequences FOR ALL
USING (created_by = auth.uid());

-- Políticas RLS para email_sequence_steps
CREATE POLICY "Users can manage steps of their sequences"
ON email_sequence_steps FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM email_sequences es 
    WHERE es.id = email_sequence_steps.sequence_id AND es.created_by = auth.uid()
  )
);

-- Políticas RLS para email_tracking_events
CREATE POLICY "Users can view tracking events for their emails"
ON email_tracking_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM emails e 
    JOIN email_accounts ea ON e.account_id = ea.id
    WHERE e.id = email_tracking_events.email_id AND ea.user_id = auth.uid()
  )
);

-- Políticas RLS para email_conversations
CREATE POLICY "Users can access conversations from their emails"
ON email_conversations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM emails e 
    JOIN email_accounts ea ON e.account_id = ea.id
    WHERE e.thread_id = email_conversations.thread_id AND ea.user_id = auth.uid()
  )
);

-- Políticas RLS para email_settings
CREATE POLICY "Users can manage their own email settings"
ON email_settings FOR ALL
USING (user_id = auth.uid());

-- Políticas RLS para email_analytics
CREATE POLICY "Users can view analytics for their emails"
ON email_analytics FOR SELECT
USING (user_id = auth.uid());

-- Triggers para updated_at
CREATE TRIGGER update_email_accounts_updated_at BEFORE UPDATE ON email_accounts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_email_sequences_updated_at BEFORE UPDATE ON email_sequences FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_email_sequence_steps_updated_at BEFORE UPDATE ON email_sequence_steps FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_email_conversations_updated_at BEFORE UPDATE ON email_conversations FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_email_settings_updated_at BEFORE UPDATE ON email_settings FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Función para procesar tracking de emails
CREATE OR REPLACE FUNCTION process_email_tracking(
  p_email_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insertar evento de tracking
  INSERT INTO email_tracking_events (
    email_id, event_type, event_data, ip_address, user_agent
  ) VALUES (
    p_email_id, p_event_type, p_event_data, p_ip_address, p_user_agent
  );
  
  -- Actualizar email con timestamp del evento
  CASE p_event_type
    WHEN 'opened' THEN
      UPDATE emails SET opened_at = COALESCE(opened_at, now()), status = 'opened' WHERE id = p_email_id;
    WHEN 'clicked' THEN
      UPDATE emails SET clicked_at = COALESCE(clicked_at, now()) WHERE id = p_email_id;
    WHEN 'replied' THEN
      UPDATE emails SET replied_at = COALESCE(replied_at, now()) WHERE id = p_email_id;
  END CASE;
  
  -- Crear entrada en analytics
  INSERT INTO email_analytics (email_id, metric_type, date_bucket, user_id)
  SELECT 
    p_email_id, 
    p_event_type, 
    CURRENT_DATE,
    ea.user_id
  FROM emails e
  JOIN email_accounts ea ON e.account_id = ea.id
  WHERE e.id = p_email_id;
END;
$$;

-- Función para generar URL de tracking pixel
CREATE OR REPLACE FUNCTION generate_tracking_pixel_url(p_email_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN '/api/email/track/pixel/' || p_email_id::text || '.png';
END;
$$;

-- Función para actualizar conversaciones automáticamente
CREATE OR REPLACE FUNCTION update_email_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Actualizar o crear conversación
  INSERT INTO email_conversations (
    thread_id, subject, participants, last_email_at, message_count,
    contact_id, lead_id, deal_id, company_id
  ) VALUES (
    NEW.thread_id,
    NEW.subject,
    ARRAY[NEW.sender_email] || NEW.recipient_emails,
    NEW.email_date,
    1,
    NEW.contact_id,
    NEW.lead_id, 
    NEW.deal_id,
    NEW.company_id
  )
  ON CONFLICT (thread_id) DO UPDATE SET
    last_email_at = NEW.email_date,
    message_count = email_conversations.message_count + 1,
    participants = array_append(email_conversations.participants, NEW.sender_email),
    updated_at = now();
    
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_conversation_on_email_insert 
  AFTER INSERT ON emails 
  FOR EACH ROW 
  EXECUTE FUNCTION update_email_conversation();

-- Habilitar Realtime para actualizaciones en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE emails;
ALTER PUBLICATION supabase_realtime ADD TABLE email_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE email_tracking_events;