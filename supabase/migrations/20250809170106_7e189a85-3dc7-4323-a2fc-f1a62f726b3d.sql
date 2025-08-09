-- Lead Task Engine: tipos, tablas, RLS, triggers, funciones
-- Asegurar esquema robusto e idempotente

-- 1) Tipos ENUM (crear si no existen)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_task_type') THEN
    CREATE TYPE public.lead_task_type AS ENUM (
      'llamada',
      'videollamada',
      'informe_mercado',
      'whatsapp',
      'preguntas_reunion'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_task_status') THEN
    CREATE TYPE public.lead_task_status AS ENUM ('open','done','snoozed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_task_priority') THEN
    CREATE TYPE public.lead_task_priority AS ENUM ('urgent','high','medium','low');
  END IF;
END $$;

-- 2) Tablas principales
CREATE TABLE IF NOT EXISTS public.lead_task_engine (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type public.lead_task_type NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  assigned_to uuid REFERENCES auth.users(id),
  priority public.lead_task_priority NOT NULL DEFAULT 'medium',
  status public.lead_task_status NOT NULL DEFAULT 'open',
  dependencies text[] DEFAULT '{}'::text[],
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  sla_hours integer,
  sla_breached boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lead_task_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.lead_task_engine(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lead_task_sla_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type public.lead_task_type NOT NULL,
  priority public.lead_task_priority NOT NULL,
  sla_hours integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lead_task_sla_policies_unique UNIQUE(task_type, priority)
);

-- 3) Índices
CREATE INDEX IF NOT EXISTS idx_lead_task_engine_lead ON public.lead_task_engine(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_task_engine_assigned_to ON public.lead_task_engine(assigned_to);
CREATE INDEX IF NOT EXISTS idx_lead_task_engine_status ON public.lead_task_engine(status);
CREATE INDEX IF NOT EXISTS idx_lead_task_engine_due_date ON public.lead_task_engine(due_date);
CREATE INDEX IF NOT EXISTS idx_lead_task_engine_priority ON public.lead_task_engine(priority);

-- 4) Funciones auxiliares y triggers
CREATE OR REPLACE FUNCTION public.update_lead_task_engine_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_lead_task_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lead_task_events (task_id, event_type, event_data, user_id)
    VALUES (NEW.id, 'task_created', jsonb_build_object('task_type', NEW.type, 'priority', NEW.priority), NEW.created_by);
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'done' AND NEW.status = 'done' THEN
      NEW.completed_at = now();
      INSERT INTO public.lead_task_events (task_id, event_type, event_data, user_id)
      VALUES (NEW.id, 'task_completed', jsonb_build_object('previous_status', OLD.status, 'completion_time', now()), auth.uid());
    END IF;

    IF OLD.status != 'snoozed' AND NEW.status = 'snoozed' THEN
      INSERT INTO public.lead_task_events (task_id, event_type, event_data, user_id)
      VALUES (NEW.id, 'task_snoozed', jsonb_build_object('previous_status', OLD.status, 'snooze_until', NEW.due_date), auth.uid());
    END IF;

    IF OLD.status = 'done' AND NEW.status = 'open' THEN
      NEW.completed_at = NULL;
      INSERT INTO public.lead_task_events (task_id, event_type, event_data, user_id)
      VALUES (NEW.id, 'task_reopened', jsonb_build_object('previous_status', OLD.status), auth.uid());
    END IF;

    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      INSERT INTO public.lead_task_events (task_id, event_type, event_data, user_id)
      VALUES (NEW.id, 'task_assigned', jsonb_build_object('previous_assignee', OLD.assigned_to, 'new_assignee', NEW.assigned_to), auth.uid());
    END IF;

    IF COALESCE(OLD.sla_breached, false) = FALSE AND COALESCE(NEW.sla_breached, false) = TRUE THEN
      INSERT INTO public.lead_task_events (task_id, event_type, event_data, user_id)
      VALUES (NEW.id, 'sla_breached', jsonb_build_object('sla_hours', NEW.sla_hours, 'breach_time', now()), NULL);
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

-- Triggers (dropear si existen para evitar duplicados)
DROP TRIGGER IF EXISTS trg_lead_task_engine_updated_at ON public.lead_task_engine;
CREATE TRIGGER trg_lead_task_engine_updated_at
BEFORE UPDATE ON public.lead_task_engine
FOR EACH ROW
EXECUTE FUNCTION public.update_lead_task_engine_updated_at();

DROP TRIGGER IF EXISTS trg_lead_task_engine_log_insert ON public.lead_task_engine;
CREATE TRIGGER trg_lead_task_engine_log_insert
AFTER INSERT ON public.lead_task_engine
FOR EACH ROW
EXECUTE FUNCTION public.log_lead_task_event();

DROP TRIGGER IF EXISTS trg_lead_task_engine_log_update ON public.lead_task_engine;
CREATE TRIGGER trg_lead_task_engine_log_update
BEFORE UPDATE ON public.lead_task_engine
FOR EACH ROW
EXECUTE FUNCTION public.log_lead_task_event();

-- Actualizar automáticamente updated_at en SLA policies
DROP TRIGGER IF EXISTS trg_lead_task_sla_policies_updated_at ON public.lead_task_sla_policies;
CREATE TRIGGER trg_lead_task_sla_policies_updated_at
BEFORE UPDATE ON public.lead_task_sla_policies
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 5) RLS y Políticas
ALTER TABLE public.lead_task_engine ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_task_sla_policies ENABLE ROW LEVEL SECURITY;

-- lead_task_engine
DROP POLICY IF EXISTS lead_tasks_select_policy ON public.lead_task_engine;
CREATE POLICY lead_tasks_select_policy ON public.lead_task_engine
FOR SELECT USING (
  created_by = auth.uid() OR assigned_to = auth.uid() OR 
  has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

DROP POLICY IF EXISTS lead_tasks_insert_policy ON public.lead_task_engine;
CREATE POLICY lead_tasks_insert_policy ON public.lead_task_engine
FOR INSERT WITH CHECK (
  created_by = auth.uid() OR 
  has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

DROP POLICY IF EXISTS lead_tasks_update_policy ON public.lead_task_engine;
CREATE POLICY lead_tasks_update_policy ON public.lead_task_engine
FOR UPDATE USING (
  created_by = auth.uid() OR assigned_to = auth.uid() OR 
  has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

DROP POLICY IF EXISTS lead_tasks_delete_policy ON public.lead_task_engine;
CREATE POLICY lead_tasks_delete_policy ON public.lead_task_engine
FOR DELETE USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- lead_task_events
DROP POLICY IF EXISTS lead_task_events_select_policy ON public.lead_task_events;
CREATE POLICY lead_task_events_select_policy ON public.lead_task_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lead_task_engine t
    WHERE t.id = lead_task_events.task_id
      AND (
        t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR 
        has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
      )
  )
);

DROP POLICY IF EXISTS lead_task_events_insert_system ON public.lead_task_events;
CREATE POLICY lead_task_events_insert_system ON public.lead_task_events
FOR INSERT WITH CHECK (true);

-- lead_task_sla_policies
DROP POLICY IF EXISTS sla_policies_manage_admin ON public.lead_task_sla_policies;
CREATE POLICY sla_policies_manage_admin ON public.lead_task_sla_policies
FOR ALL USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
) WITH CHECK (
  has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

DROP POLICY IF EXISTS sla_policies_select_all ON public.lead_task_sla_policies;
CREATE POLICY sla_policies_select_all ON public.lead_task_sla_policies
FOR SELECT USING (true);

-- 6) RPC: Obtener tareas con dependencias y 'can_start'
CREATE OR REPLACE FUNCTION public.get_lead_tasks_with_dependencies(p_lead_id UUID)
RETURNS TABLE (
  id UUID,
  lead_id UUID,
  type public.lead_task_type,
  title TEXT,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID,
  priority public.lead_task_priority,
  status public.lead_task_status,
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
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
      (SELECT jsonb_object_agg(dep, dep_status)
       FROM (
         SELECT dep, COALESCE(dep_task.status::text, 'missing') AS dep_status
         FROM unnest(lte.dependencies) dep
         LEFT JOIN public.lead_task_engine dep_task 
           ON dep_task.lead_id = p_lead_id 
           AND dep_task.type::text = dep
       ) s
      ),
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

-- 7) Semillas mínimas SLA (solo si tabla vacía)
INSERT INTO public.lead_task_sla_policies (task_type, priority, sla_hours)
SELECT x.task_type::public.lead_task_type, x.priority::public.lead_task_priority, x.sla_hours
FROM (
  VALUES
    ('llamada','urgent',24),
    ('llamada','high',48),
    ('llamada','medium',72),
    ('llamada','low',120),
    ('videollamada','medium',96),
    ('informe_mercado','medium',120),
    ('whatsapp','high',24),
    ('preguntas_reunion','medium',48)
) as x(task_type, priority, sla_hours)
ON CONFLICT (task_type, priority) DO NOTHING;