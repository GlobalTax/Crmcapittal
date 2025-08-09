-- 8) SLA por tipo, recordatorios y dependencias (Lead Task Engine)

-- Tabla de políticas SLA por tipo y prioridad
CREATE TABLE IF NOT EXISTS public.lead_task_sla_policies (
  task_type text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  sla_hours integer NOT NULL,
  reminder_pre_hours integer NOT NULL DEFAULT 24,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (task_type, priority)
);

ALTER TABLE public.lead_task_sla_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sla_policies_select" ON public.lead_task_sla_policies;
CREATE POLICY "sla_policies_select" ON public.lead_task_sla_policies FOR SELECT USING (true);
DROP POLICY IF EXISTS "sla_policies_admin_write" ON public.lead_task_sla_policies;
CREATE POLICY "sla_policies_admin_write" ON public.lead_task_sla_policies FOR ALL USING (has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)) WITH CHECK (has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role));

-- Upsert SLAs (en horas)
INSERT INTO public.lead_task_sla_policies (task_type, priority, sla_hours)
VALUES 
  ('whatsapp','low',0),('whatsapp','medium',0),('whatsapp','high',0),('whatsapp','urgent',0),
  ('llamada','low',24),('llamada','medium',24),('llamada','high',24),('llamada','urgent',24),
  ('videollamada','low',0),('videollamada','medium',0),('videollamada','high',0),('videollamada','urgent',0),
  ('datos_sabi','low',0),('datos_sabi','medium',0),('datos_sabi','high',0),('datos_sabi','urgent',0),
  ('balances_4y','low',48),('balances_4y','medium',48),('balances_4y','high',48),('balances_4y','urgent',48),
  ('informe_mercado','low',48),('informe_mercado','medium',48),('informe_mercado','high',48),('informe_mercado','urgent',48),
  ('valoracion_inicial','low',24),('valoracion_inicial','medium',24),('valoracion_inicial','high',24),('valoracion_inicial','urgent',24),
  ('preguntas_reunion','low',24),('preguntas_reunion','medium',24),('preguntas_reunion','high',24),('preguntas_reunion','urgent',24),
  ('perfilar_oportunidad','low',72),('perfilar_oportunidad','medium',72),('perfilar_oportunidad','high',72),('perfilar_oportunidad','urgent',72)
ON CONFLICT (task_type, priority) DO UPDATE SET sla_hours = EXCLUDED.sla_hours, updated_at = now();

-- Auditoría de cambios críticos en Lead Task Engine
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
DROP POLICY IF EXISTS "engine_audits_select_related" ON public.lead_task_engine_audits;
CREATE POLICY "engine_audits_select_related"
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
  oldv jsonb := '{}';
  newv jsonb := '{}';
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

-- Notificaciones para recordatorios
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
DROP POLICY IF EXISTS "engine_notifications_select_related" ON public.lead_task_engine_notifications;
CREATE POLICY "engine_notifications_select_related"
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
  SELECT t.id, t.lead_id, COALESCE(t.title, t.type), t.type, t.due_date, COALESCE(t.assigned_to, t.created_by) as assignee, l.name as lead_name, 'pre_sla'::text
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
  SELECT t.id, t.lead_id, COALESCE(t.title, t.type), t.type, t.due_date, COALESCE(t.assigned_to, t.created_by) as assignee, l.name as lead_name, 'due'::text
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

-- RLS en lead_task_engine: asegurar permisos y reasignación por owner/managers
ALTER TABLE public.lead_task_engine ENABLE ROW LEVEL SECURITY;

-- Selección
DROP POLICY IF EXISTS "engine_select_related" ON public.lead_task_engine;
CREATE POLICY "engine_select_related" ON public.lead_task_engine FOR SELECT USING (
  created_by = auth.uid() OR assigned_to = auth.uid() OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role) OR
  EXISTS (SELECT 1 FROM public.leads l WHERE l.id = lead_id AND l.created_by = auth.uid())
);

-- Inserción (el creador)
DROP POLICY IF EXISTS "engine_insert_creator" ON public.lead_task_engine;
CREATE POLICY "engine_insert_creator" ON public.lead_task_engine FOR INSERT WITH CHECK (created_by = auth.uid());

-- Actualización: visible + control de reasignación
DROP POLICY IF EXISTS "engine_update_visible" ON public.lead_task_engine;
CREATE POLICY "engine_update_visible" ON public.lead_task_engine FOR UPDATE USING (
  created_by = auth.uid() OR assigned_to = auth.uid() OR has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
) WITH CHECK (
  -- Si se intenta cambiar assigned_to, debe hacerlo el owner o un manager
  (NEW.assigned_to IS NOT DISTINCT FROM OLD.assigned_to) OR created_by = auth.uid() OR has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Borrado: owner o managers
DROP POLICY IF EXISTS "engine_delete_owner" ON public.lead_task_engine;
CREATE POLICY "engine_delete_owner" ON public.lead_task_engine FOR DELETE USING (
  created_by = auth.uid() OR has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- 10) Métricas clave básicas (KPIs)
CREATE OR REPLACE FUNCTION public.get_task_engine_metrics()
RETURNS jsonb AS $$
DECLARE
  result jsonb := '{}'::jsonb;
BEGIN
  -- Completion rate por tipo (últimos 60 días)
  result := result || jsonb_build_object(
    'completion_rate_by_type', (
      SELECT jsonb_object_agg(type, rate)
      FROM (
        SELECT type,
          CASE WHEN COUNT(*) = 0 THEN 0 ELSE ROUND( (SUM( (status='done')::int)::numeric * 100) / COUNT(*)) END as rate
        FROM public.lead_task_engine
        WHERE created_at >= now() - interval '60 days'
        GROUP BY type
      ) s
    )
  );

  -- SLA breach rate (últimos 60 días)
  result := result || jsonb_build_object(
    'sla_breach_rate', (
      SELECT CASE WHEN COUNT(*) = 0 THEN 0 ELSE ROUND( (SUM( (sla_breached = true)::int)::numeric * 100) / COUNT(*)) END
      FROM public.lead_task_engine
      WHERE created_at >= now() - interval '60 days'
    )
  );

  -- Tiempo a valoración inicial (lead->PDF generado): usamos completed_at de la tarea valoracion_inicial
  result := result || jsonb_build_object(
    'time_to_valuation_hours', (
      SELECT ROUND(AVG(EXTRACT(EPOCH FROM (t.completed_at - l.created_at)) / 3600))::int
      FROM public.leads l
      JOIN public.lead_task_engine t ON t.lead_id = l.id AND t.type = 'valoracion_inicial' AND t.completed_at IS NOT NULL
      WHERE l.created_at >= now() - interval '180 days'
    )
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';