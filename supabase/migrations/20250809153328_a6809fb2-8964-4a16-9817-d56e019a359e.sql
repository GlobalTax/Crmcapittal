-- Create enums for LeadTaskEngine
CREATE TYPE lead_task_type AS ENUM (
  'valoracion_inicial',
  'llamada', 
  'whatsapp',
  'informe_mercado',
  'datos_sabi',
  'balances_4y',
  'preguntas_reunion',
  'videollamada',
  'perfilar_oportunidad'
);

CREATE TYPE lead_task_status AS ENUM (
  'open',
  'done', 
  'snoozed'
);

CREATE TYPE lead_task_priority AS ENUM (
  'low',
  'medium',
  'high', 
  'urgent'
);

CREATE TYPE lead_task_event_type AS ENUM (
  'task_created',
  'task_completed',
  'task_snoozed',
  'task_reopened',
  'sla_breached',
  'task_assigned',
  'task_dependency_resolved'
);

-- Main task engine table
CREATE TABLE public.lead_task_engine (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type lead_task_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES auth.users(id),
  priority lead_task_priority NOT NULL DEFAULT 'medium',
  status lead_task_status NOT NULL DEFAULT 'open',
  dependencies TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  sla_hours INTEGER,
  sla_breached BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Task events for telemetry
CREATE TABLE public.lead_task_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.lead_task_engine(id) ON DELETE CASCADE,
  event_type lead_task_event_type NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SLA policies configuration
CREATE TABLE public.lead_task_sla_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_type lead_task_type NOT NULL UNIQUE,
  default_sla_hours INTEGER NOT NULL DEFAULT 24,
  escalation_rules JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default SLA policies
INSERT INTO public.lead_task_sla_policies (task_type, default_sla_hours) VALUES
('valoracion_inicial', 4),
('llamada', 2), 
('whatsapp', 1),
('informe_mercado', 48),
('datos_sabi', 24),
('balances_4y', 72),
('preguntas_reunion', 8),
('videollamada', 4),
('perfilar_oportunidad', 24);

-- Create indexes for performance
CREATE INDEX idx_lead_task_engine_lead_id ON public.lead_task_engine(lead_id);
CREATE INDEX idx_lead_task_engine_status ON public.lead_task_engine(status);
CREATE INDEX idx_lead_task_engine_assigned_to ON public.lead_task_engine(assigned_to);
CREATE INDEX idx_lead_task_engine_due_date ON public.lead_task_engine(due_date);
CREATE INDEX idx_lead_task_events_task_id ON public.lead_task_events(task_id);
CREATE INDEX idx_lead_task_events_type ON public.lead_task_events(event_type);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_lead_task_engine_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lead_task_engine_updated_at
  BEFORE UPDATE ON public.lead_task_engine
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_task_engine_updated_at();

-- Trigger for task events
CREATE OR REPLACE FUNCTION public.log_lead_task_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Log task creation
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lead_task_events (task_id, event_type, event_data, user_id)
    VALUES (NEW.id, 'task_created', jsonb_build_object('task_type', NEW.type, 'priority', NEW.priority), NEW.created_by);
    RETURN NEW;
  END IF;
  
  -- Log status changes
  IF TG_OP = 'UPDATE' THEN
    -- Task completed
    IF OLD.status != 'done' AND NEW.status = 'done' THEN
      NEW.completed_at = now();
      INSERT INTO public.lead_task_events (task_id, event_type, event_data, user_id)
      VALUES (NEW.id, 'task_completed', jsonb_build_object('previous_status', OLD.status, 'completion_time', now()), auth.uid());
    END IF;
    
    -- Task snoozed
    IF OLD.status != 'snoozed' AND NEW.status = 'snoozed' THEN
      INSERT INTO public.lead_task_events (task_id, event_type, event_data, user_id)
      VALUES (NEW.id, 'task_snoozed', jsonb_build_object('previous_status', OLD.status, 'snooze_until', NEW.due_date), auth.uid());
    END IF;
    
    -- Task reopened
    IF OLD.status = 'done' AND NEW.status = 'open' THEN
      NEW.completed_at = NULL;
      INSERT INTO public.lead_task_events (task_id, event_type, event_data, user_id)
      VALUES (NEW.id, 'task_reopened', jsonb_build_object('previous_status', OLD.status), auth.uid());
    END IF;
    
    -- Assignment changed
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      INSERT INTO public.lead_task_events (task_id, event_type, event_data, user_id)
      VALUES (NEW.id, 'task_assigned', jsonb_build_object('previous_assignee', OLD.assigned_to, 'new_assignee', NEW.assigned_to), auth.uid());
    END IF;
    
    -- SLA breach detection
    IF OLD.sla_breached = FALSE AND NEW.sla_breached = TRUE THEN
      INSERT INTO public.lead_task_events (task_id, event_type, event_data, user_id)
      VALUES (NEW.id, 'sla_breached', jsonb_build_object('sla_hours', NEW.sla_hours, 'breach_time', now()), NULL);
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER lead_task_event_logger
  AFTER INSERT OR UPDATE ON public.lead_task_engine
  FOR EACH ROW
  EXECUTE FUNCTION public.log_lead_task_event();

-- RLS Policies
ALTER TABLE public.lead_task_engine ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_task_sla_policies ENABLE ROW LEVEL SECURITY;

-- Users can manage tasks for leads they have access to
CREATE POLICY "Users can view lead tasks they have access to" ON public.lead_task_engine
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = lead_task_engine.lead_id
      AND (leads.assigned_to_id = auth.uid() OR leads.created_by = auth.uid() OR 
           has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role))
    )
  );

CREATE POLICY "Users can create lead tasks for accessible leads" ON public.lead_task_engine
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = lead_task_engine.lead_id
      AND (leads.assigned_to_id = auth.uid() OR leads.created_by = auth.uid() OR 
           has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role))
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update lead tasks they have access to" ON public.lead_task_engine
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = lead_task_engine.lead_id
      AND (leads.assigned_to_id = auth.uid() OR leads.created_by = auth.uid() OR 
           assigned_to = auth.uid() OR has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role))
    )
  );

CREATE POLICY "Users can delete lead tasks they created" ON public.lead_task_engine
  FOR DELETE USING (
    created_by = auth.uid() OR has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

-- Task events policies
CREATE POLICY "Users can view task events for accessible tasks" ON public.lead_task_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lead_task_engine lte
      JOIN public.leads l ON l.id = lte.lead_id
      WHERE lte.id = lead_task_events.task_id
      AND (l.assigned_to_id = auth.uid() OR l.created_by = auth.uid() OR 
           lte.assigned_to = auth.uid() OR has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role))
    )
  );

CREATE POLICY "System can insert task events" ON public.lead_task_events
  FOR INSERT WITH CHECK (true);

-- SLA policies - read-only for non-admins
CREATE POLICY "Users can view SLA policies" ON public.lead_task_sla_policies
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage SLA policies" ON public.lead_task_sla_policies
  FOR ALL USING (has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role));

-- Function to get tasks with dependency status
CREATE OR REPLACE FUNCTION public.get_lead_tasks_with_dependencies(p_lead_id UUID)
RETURNS TABLE (
  id UUID,
  lead_id UUID,
  type lead_task_type,
  title TEXT,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID,
  priority lead_task_priority,
  status lead_task_status,
  dependencies TEXT[],
  metadata JSONB,
  sla_hours INTEGER,
  sla_breached BOOLEAN,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  can_start BOOLEAN,
  dependency_status JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lte.*,
    CASE 
      WHEN array_length(lte.dependencies, 1) IS NULL THEN TRUE
      ELSE NOT EXISTS (
        SELECT 1 FROM unnest(lte.dependencies) dep
        WHERE NOT EXISTS (
          SELECT 1 FROM public.lead_task_engine dep_task
          WHERE dep_task.lead_id = p_lead_id
          AND dep_task.type::text = dep
          AND dep_task.status = 'done'
        )
      )
    END as can_start,
    COALESCE(
      (SELECT jsonb_object_agg(dep, status)
       FROM unnest(lte.dependencies) dep
       LEFT JOIN public.lead_task_engine dep_task 
         ON dep_task.lead_id = p_lead_id 
         AND dep_task.type::text = dep),
      '{}'::jsonb
    ) as dependency_status
  FROM public.lead_task_engine lte
  WHERE lte.lead_id = p_lead_id
  ORDER BY 
    CASE lte.priority
      WHEN 'urgent' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    lte.created_at;
END;
$$;