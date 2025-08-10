-- Lead Task Engine: auditoría, recordatorios y permisos de reasignación
-- 1) Auditoría de cambios críticos (due_date, assigned_to, status)
CREATE TABLE IF NOT EXISTS public.lead_task_engine_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.lead_task_engine(id) ON DELETE CASCADE,
  changed_by uuid NULL,
  change_type text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_task_engine_audits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS engine_audits_select_related ON public.lead_task_engine_audits;
CREATE POLICY engine_audits_select_related
ON public.lead_task_engine_audits FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lead_task_engine t
    WHERE t.id = task_id AND (
      t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR
      has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role) OR
      EXISTS (SELECT 1 FROM public.leads l WHERE l.id = t.lead_id AND l.created_by = auth.uid())
    )
  )
);

CREATE OR REPLACE FUNCTION public.log_lead_task_engine_audit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  oldv jsonb := '{}'::jsonb;
  newv jsonb := '{}'::jsonb;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.due_date IS DISTINCT FROM NEW.due_date THEN
      oldv := oldv || jsonb_build_object('due_date', OLD.due_date);
      newv := newv || jsonb_build_object('due_date', NEW.due_date);
    END IF;
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      oldv := oldv || jsonb_build_object('assigned_to', OLD.assigned_to);
      newv := newv || jsonb_build_object('assigned_to', NEW.assigned_to);
    END IF;
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      oldv := oldv || jsonb_build_object('status', OLD.status);
      newv := newv || jsonb_build_object('status', NEW.status);
    END IF;
    IF oldv <> '{}'::jsonb OR newv <> '{}'::jsonb THEN
      INSERT INTO public.lead_task_engine_audits(task_id, changed_by, change_type, old_data, new_data)
      VALUES (NEW.id, auth.uid(), 'update', oldv, newv);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_lead_task_engine_audit ON public.lead_task_engine;
CREATE TRIGGER trg_log_lead_task_engine_audit
AFTER UPDATE OF due_date, assigned_to, status ON public.lead_task_engine
FOR EACH ROW EXECUTE FUNCTION public.log_lead_task_engine_audit();

-- 2) Notificaciones de recordatorios (pre-SLA y vencidos)
CREATE TABLE IF NOT EXISTS public.lead_task_engine_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.lead_task_engine(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('pre_sla','due')),
  channel text NOT NULL DEFAULT 'slack',
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (task_id, kind)
);

ALTER TABLE public.lead_task_engine_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS engine_notifications_select_related ON public.lead_task_engine_notifications;
CREATE POLICY engine_notifications_select_related
ON public.lead_task_engine_notifications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lead_task_engine t
    WHERE t.id = task_id AND (
      t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR
      has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
    )
  )
);

-- RPC: obtener tareas que requieren recordatorio (pre SLA y vencidas)
CREATE OR REPLACE FUNCTION public.get_pending_engine_task_reminders()
RETURNS TABLE(
  task_id uuid,
  lead_id uuid,
  title text,
  task_type text,
  due_date timestamptz,
  assignee uuid,
  lead_name text,
  kind text
) AS $$
BEGIN
  RETURN QUERY
  -- Pre-SLA (dentro de 24h)
  SELECT t.id, t.lead_id, COALESCE(t.title, t.type::text), t.type::text, t.due_date, COALESCE(t.assigned_to, t.created_by) as assignee, l.name as lead_name, 'pre_sla'::text
  FROM public.lead_task_engine t
  LEFT JOIN public.leads l ON l.id = t.lead_id
  WHERE t.status = 'open'
    AND t.due_date IS NOT NULL
    AND t.due_date > now()
    AND t.due_date <= now() + interval '24 hours'
    AND NOT EXISTS (
      SELECT 1 FROM public.lead_task_engine_notifications n
      WHERE n.task_id = t.id AND n.kind = 'pre_sla'
    )
  UNION ALL
  -- Vencidas
  SELECT t.id, t.lead_id, COALESCE(t.title, t.type::text), t.type::text, t.due_date, COALESCE(t.assigned_to, t.created_by) as assignee, l.name as lead_name, 'due'::text
  FROM public.lead_task_engine t
  LEFT JOIN public.leads l ON l.id = t.lead_id
  WHERE t.status = 'open'
    AND t.due_date IS NOT NULL
    AND t.due_date <= now()
    AND NOT EXISTS (
      SELECT 1 FROM public.lead_task_engine_notifications n
      WHERE n.task_id = t.id AND n.kind = 'due'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- RPC: marcar notificado
CREATE OR REPLACE FUNCTION public.mark_engine_task_notified(p_task_id uuid, p_kind text)
RETURNS void AS $$
BEGIN
  INSERT INTO public.lead_task_engine_notifications(task_id, kind)
  VALUES (p_task_id, p_kind)
  ON CONFLICT (task_id, kind) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- 3) Corregir ambigüedad y asegurar aliasado en la RPC principal de lectura
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
    lte.id,
    lte.lead_id,
    lte.type,
    lte.title,
    lte.description,
    lte.due_date,
    lte.assigned_to,
    lte.priority,
    lte.status,
    lte.dependencies,
    lte.metadata,
    lte.sla_hours,
    lte.sla_breached,
    lte.completed_at,
    lte.created_by,
    lte.created_at,
    lte.updated_at,
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

-- 4) Reglas RLS de actualización y trigger de control de reasignación
DROP POLICY IF EXISTS engine_update_visible ON public.lead_task_engine;
CREATE POLICY engine_update_visible ON public.lead_task_engine FOR UPDATE USING (
  created_by = auth.uid() OR assigned_to = auth.uid() OR has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.enforce_engine_task_reassignment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  is_admin boolean;
BEGIN
  IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
    is_admin := has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role);
    IF NOT (is_admin OR OLD.created_by = auth.uid()) THEN
      RAISE EXCEPTION 'Solo el creador de la tarea o managers pueden reasignar';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_engine_task_reassignment ON public.lead_task_engine;
CREATE TRIGGER trg_enforce_engine_task_reassignment
BEFORE UPDATE OF assigned_to ON public.lead_task_engine
FOR EACH ROW EXECUTE FUNCTION public.enforce_engine_task_reassignment();