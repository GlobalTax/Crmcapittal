-- Harden functions: set search_path to 'public'
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

    IF OLD.sla_breached = FALSE AND NEW.sla_breached = TRUE THEN
      INSERT INTO public.lead_task_events (task_id, event_type, event_data, user_id)
      VALUES (NEW.id, 'sla_breached', jsonb_build_object('sla_hours', NEW.sla_hours, 'breach_time', now()), NULL);
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

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