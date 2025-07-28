-- Fix the remaining functions with mutable search paths

CREATE OR REPLACE FUNCTION public.log_mandate_target_activity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.mandate_target_activities (
      target_id,
      activity_type,
      title,
      description,
      activity_data,
      created_by
    ) VALUES (
      NEW.id,
      'status_change',
      'Estado cambiado',
      'El estado del target ha cambiado de ' || OLD.status || ' a ' || NEW.status,
      jsonb_build_object(
        'previous_status', OLD.status,
        'new_status', NEW.status,
        'automated', true
      ),
      auth.uid()
    );
  END IF;
  
  IF TG_OP = 'UPDATE' AND NEW.contacted = true AND OLD.contacted = false THEN
    INSERT INTO public.mandate_target_activities (
      target_id,
      activity_type,
      title,
      description,
      activity_data,
      created_by
    ) VALUES (
      NEW.id,
      'contact_made',
      'Primer contacto realizado',
      'Se ha establecido el primer contacto con el target',
      jsonb_build_object(
        'contact_method', NEW.contact_method,
        'contact_date', NEW.contact_date,
        'automated', true
      ),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_contact_task_activity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.contact_activities (
      contact_id,
      activity_type,
      title,
      description,
      activity_data,
      created_by
    ) VALUES (
      NEW.contact_id,
      'task_created',
      'Tarea creada: ' || NEW.title,
      COALESCE(NEW.description, 'Nueva tarea asignada'),
      jsonb_build_object(
        'task_title', NEW.title,
        'priority', NEW.priority,
        'due_date', NEW.due_date,
        'assigned_to', NEW.assigned_to
      ),
      NEW.created_by
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND OLD.completed = false AND NEW.completed = true THEN
    INSERT INTO public.contact_activities (
      contact_id,
      activity_type,
      title,
      description,
      activity_data,
      created_by
    ) VALUES (
      NEW.contact_id,
      'task_completed',
      'Tarea completada: ' || NEW.title,
      'La tarea ha sido marcada como completada',
      jsonb_build_object(
        'task_title', NEW.title,
        'completed_by', auth.uid()
      ),
      auth.uid()
    );
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_company_note_activity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.company_activities (
      company_id,
      activity_type,
      title,
      description,
      activity_data,
      created_by
    ) VALUES (
      NEW.company_id,
      'note_added',
      'Nota añadida',
      LEFT(NEW.note, 100) || CASE WHEN LENGTH(NEW.note) > 100 THEN '...' ELSE '' END,
      jsonb_build_object(
        'note_type', NEW.note_type,
        'full_note', NEW.note
      ),
      NEW.created_by
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_contact_interaction_activity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.contact_activities (
      contact_id,
      activity_type,
      title,
      description,
      activity_data,
      created_by
    ) VALUES (
      NEW.contact_id,
      'interaction_logged',
      'Nueva interacción: ' || NEW.interaction_type,
      COALESCE(NEW.description, 'Interacción registrada'),
      jsonb_build_object(
        'interaction_type', NEW.interaction_type,
        'interaction_method', NEW.interaction_method,
        'duration_minutes', NEW.duration_minutes,
        'outcome', NEW.outcome,
        'next_action', NEW.next_action,
        'interaction_date', NEW.interaction_date
      ),
      NEW.created_by
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_contact_note_activity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.contact_activities (
      contact_id,
      activity_type,
      title,
      description,
      activity_data,
      created_by
    ) VALUES (
      NEW.contact_id,
      'note_added',
      'Nota añadida',
      LEFT(NEW.note, 100) || CASE WHEN LENGTH(NEW.note) > 100 THEN '...' ELSE '' END,
      jsonb_build_object(
        'note_type', NEW.note_type,
        'full_note', NEW.note
      ),
      NEW.created_by
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_contact_task_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_company_file_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_contact_file_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;