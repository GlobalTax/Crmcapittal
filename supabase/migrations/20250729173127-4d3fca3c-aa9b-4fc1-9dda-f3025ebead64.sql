-- Add prob_conversion field to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS prob_conversion DECIMAL(3,2) DEFAULT 0.00 CHECK (prob_conversion >= 0 AND prob_conversion <= 1);

-- Create notification_rules table for configurable triggers
CREATE TABLE IF NOT EXISTS public.notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'high_score_lead', 'task_reminder', 'high_prob_negotiation'
  is_active BOOLEAN DEFAULT true,
  conditions JSONB NOT NULL,
  notification_config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create notification_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.notification_rules(id),
  lead_id UUID REFERENCES public.leads(id),
  task_id UUID REFERENCES public.lead_tasks(id),
  notification_type TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  delivery_status TEXT DEFAULT 'sent',
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS for notification_rules
ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;

-- Enable RLS for notification_logs  
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_rules
CREATE POLICY "Admin users can manage notification rules" 
ON public.notification_rules 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- RLS policies for notification_logs
CREATE POLICY "Users can view their own notification logs" 
ON public.notification_logs 
FOR SELECT 
USING (
  auth.uid() = recipient_user_id OR
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "System can insert notification logs" 
ON public.notification_logs 
FOR INSERT 
WITH CHECK (true);

-- Insert default notification rules
INSERT INTO public.notification_rules (rule_name, rule_type, conditions, notification_config) VALUES
('Lead HOT Score', 'high_score_lead', 
 '{"min_score": 70}', 
 '{"in_app": true, "email": true, "message": "Lead HOT - {lead_name} tiene un score de {score}"}'),
('Task Due Today Reminders', 'task_reminder', 
 '{"reminder_times": ["09:00", "16:00"], "days_ahead": 0}', 
 '{"in_app": true, "email": true, "message": "Recordatorio: Tarea {task_title} vence hoy"}'),
('High Probability Negotiation', 'high_prob_negotiation', 
 '{"stage_name": "Negociación", "min_prob_conversion": 0.8}', 
 '{"in_app": true, "email": true, "message": "Lead en negociación con alta probabilidad de cierre: {lead_name}"}');

-- Create function to update prob_conversion based on lead score
CREATE OR REPLACE FUNCTION public.calculate_prob_conversion(p_lead_score INTEGER)
RETURNS DECIMAL(3,2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Simple conversion: score/100 with some adjustments
  RETURN GREATEST(0.0, LEAST(1.0, (p_lead_score::DECIMAL / 100.0)));
END;
$$;

-- Create trigger to auto-update prob_conversion when lead_score changes
CREATE OR REPLACE FUNCTION public.update_prob_conversion_on_score_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Update prob_conversion based on lead score
  IF NEW.score IS DISTINCT FROM OLD.score THEN
    NEW.prob_conversion = public.calculate_prob_conversion(COALESCE(NEW.score, 0));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for leads table
DROP TRIGGER IF EXISTS trigger_update_prob_conversion ON public.leads;
CREATE TRIGGER trigger_update_prob_conversion
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_prob_conversion_on_score_change();

-- Update existing leads with prob_conversion values
UPDATE public.leads 
SET prob_conversion = public.calculate_prob_conversion(COALESCE(score, 0))
WHERE prob_conversion IS NULL OR prob_conversion = 0;