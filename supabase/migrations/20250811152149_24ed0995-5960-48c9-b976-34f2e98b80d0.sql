-- Limpieza de triggers duplicados que llamen a execute_stage_automations y recreación de uno único
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT tgname
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_proc p ON t.tgfoid = p.oid
    WHERE c.relname = 'leads'
      AND p.proname = 'execute_stage_automations'
      AND NOT t.tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.leads', rec.tgname);
  END LOOP;
END$$;

-- Recrear un solo trigger bien definido
CREATE TRIGGER leads_after_stage_update
AFTER UPDATE OF pipeline_stage_id ON public.leads
FOR EACH ROW
WHEN (OLD.pipeline_stage_id IS DISTINCT FROM NEW.pipeline_stage_id)
EXECUTE FUNCTION public.execute_stage_automations();

-- Reemplazar función con control de idempotencia y destino configurable
CREATE OR REPLACE FUNCTION public.execute_stage_automations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  automation_record RECORD;
  task_title text;
  task_due_date timestamptz;
  assigned_user_id uuid;
  destination text;
  task_priority text;
  task_description text;
  engine_type text;
BEGIN
  -- Solo ejecutar si cambió la etapa
  IF OLD.pipeline_stage_id IS DISTINCT FROM NEW.pipeline_stage_id THEN
    FOR automation_record IN 
      SELECT * FROM public.pipeline_stage_automations 
      WHERE stage_id = NEW.pipeline_stage_id 
        AND is_active = true
      ORDER BY priority DESC, created_at ASC
    LOOP
      CASE automation_record.action_type
        WHEN 'create_task' THEN
          task_title := COALESCE(automation_record.action_data->>'title', 'Tarea automática');
          task_due_date := now() + (COALESCE(automation_record.action_data->>'due_in_days', '2')::integer || ' days')::interval;
          assigned_user_id := COALESCE((automation_record.action_data->>'assigned_to_id')::uuid, NEW.assigned_to_id);
          destination := COALESCE(NULLIF(LOWER(automation_record.action_data->>'destination'), ''), 'lead_tasks');
          task_priority := COALESCE(NULLIF(automation_record.action_data->>'priority', ''), 'medium');
          task_description := COALESCE(NULLIF(automation_record.action_data->>'description', ''), 'Tarea creada automáticamente al cambiar de etapa');
          engine_type := COALESCE(NULLIF(automation_record.action_data->>'type', ''), 'follow_up');

          IF destination = 'engine' THEN
            -- Idempotencia para lead_task_engine
            IF NOT EXISTS (
              SELECT 1 FROM public.lead_task_engine t
              WHERE t.lead_id = NEW.id
                AND COALESCE(t.title, t.type::text) = task_title
                AND t.status = 'open'
                AND t.due_date IS NOT NULL
                AND (t.due_date::date) = (task_due_date::date)
            ) THEN
              INSERT INTO public.lead_task_engine (
                lead_id, type, title, description, due_date, priority, assigned_to, created_by, status
              ) VALUES (
                NEW.id,
                engine_type,
                task_title,
                task_description,
                task_due_date,
                task_priority,
                assigned_user_id,
                COALESCE(NEW.assigned_to_id, auth.uid()),
                'open'
              );
            END IF;
          ELSE
            -- Idempotencia para lead_tasks (clásico)
            IF NOT EXISTS (
              SELECT 1 FROM public.lead_tasks lt
              WHERE lt.lead_id = NEW.id
                AND lt.title = task_title
                AND lt.status IN ('pending', 'open')
                AND lt.due_date IS NOT NULL
                AND (lt.due_date::date) = (task_due_date::date)
            ) THEN
              INSERT INTO public.lead_tasks (
                lead_id, title, description, due_date, priority, assigned_to, created_by, status
              ) VALUES (
                NEW.id,
                task_title,
                task_description,
                task_due_date,
                task_priority,
                assigned_user_id,
                COALESCE(NEW.assigned_to_id, auth.uid()),
                'pending'
              );
            END IF;
          END IF;
      END CASE;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Desduplicación de tareas clásicas manteniendo la más antigua
WITH ranked AS (
  SELECT id, lead_id, title, (due_date::date) AS dd, status,
         ROW_NUMBER() OVER (PARTITION BY lead_id, title, (due_date::date), status ORDER BY created_at) rn
  FROM public.lead_tasks
  WHERE status IN ('pending','open')
), to_delete AS (
  SELECT id FROM ranked WHERE rn > 1
)
DELETE FROM public.lead_tasks lt
USING to_delete td
WHERE lt.id = td.id;

-- Desduplicación de engine tasks manteniendo la más antigua
WITH ranked_e AS (
  SELECT id, lead_id, COALESCE(title, type::text) AS tt, (due_date::date) AS dd, status,
         ROW_NUMBER() OVER (PARTITION BY lead_id, COALESCE(title, type::text), (due_date::date), status ORDER BY created_at) rn
  FROM public.lead_task_engine
  WHERE status = 'open'
), to_delete_e AS (
  SELECT id FROM ranked_e WHERE rn > 1
)
DELETE FROM public.lead_task_engine t
USING to_delete_e td
WHERE t.id = td.id;