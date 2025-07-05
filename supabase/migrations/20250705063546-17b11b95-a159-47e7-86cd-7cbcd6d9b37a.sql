-- Create triggers for automatic activity logging on contacts table
CREATE OR REPLACE FUNCTION public.log_contact_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Handle INSERT (contact created)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.contact_activities (
      contact_id,
      activity_type,
      title,
      description,
      activity_data,
      created_by
    ) VALUES (
      NEW.id,
      'contact_created',
      'Contacto creado',
      'Se ha creado un nuevo contacto en el sistema',
      jsonb_build_object(
        'contact_name', NEW.name,
        'contact_email', NEW.email,
        'contact_type', NEW.contact_type
      ),
      NEW.created_by
    );
    RETURN NEW;
  END IF;

  -- Handle UPDATE (contact modified)
  IF TG_OP = 'UPDATE' THEN
    DECLARE
      changes jsonb := '{}'::jsonb;
      change_description text := '';
    BEGIN
      -- Track field changes
      IF OLD.name != NEW.name THEN
        changes := changes || jsonb_build_object('name', jsonb_build_object('from', OLD.name, 'to', NEW.name));
        change_description := change_description || 'Nombre cambiado de "' || OLD.name || '" a "' || NEW.name || '". ';
      END IF;
      
      IF OLD.email != NEW.email THEN
        changes := changes || jsonb_build_object('email', jsonb_build_object('from', OLD.email, 'to', NEW.email));
        change_description := change_description || 'Email cambiado de "' || COALESCE(OLD.email, 'vacío') || '" a "' || COALESCE(NEW.email, 'vacío') || '". ';
      END IF;
      
      IF OLD.phone != NEW.phone THEN
        changes := changes || jsonb_build_object('phone', jsonb_build_object('from', OLD.phone, 'to', NEW.phone));
        change_description := change_description || 'Teléfono cambiado de "' || COALESCE(OLD.phone, 'vacío') || '" a "' || COALESCE(NEW.phone, 'vacío') || '". ';
      END IF;
      
      IF OLD.company != NEW.company THEN
        changes := changes || jsonb_build_object('company', jsonb_build_object('from', OLD.company, 'to', NEW.company));
        change_description := change_description || 'Empresa cambiada de "' || COALESCE(OLD.company, 'vacío') || '" a "' || COALESCE(NEW.company, 'vacío') || '". ';
      END IF;
      
      IF OLD.position != NEW.position THEN
        changes := changes || jsonb_build_object('position', jsonb_build_object('from', OLD.position, 'to', NEW.position));
        change_description := change_description || 'Cargo cambiado de "' || COALESCE(OLD.position, 'vacío') || '" a "' || COALESCE(NEW.position, 'vacío') || '". ';
      END IF;
      
      IF OLD.contact_type != NEW.contact_type THEN
        changes := changes || jsonb_build_object('contact_type', jsonb_build_object('from', OLD.contact_type, 'to', NEW.contact_type));
        change_description := change_description || 'Tipo de contacto cambiado de "' || OLD.contact_type || '" a "' || NEW.contact_type || '". ';
      END IF;
      
      IF OLD.contact_priority != NEW.contact_priority THEN
        changes := changes || jsonb_build_object('contact_priority', jsonb_build_object('from', OLD.contact_priority, 'to', NEW.contact_priority));
        change_description := change_description || 'Prioridad cambiada de "' || COALESCE(OLD.contact_priority, 'vacío') || '" a "' || COALESCE(NEW.contact_priority, 'vacío') || '". ';
      END IF;

      -- Only log if there are actual changes
      IF changes != '{}'::jsonb THEN
        INSERT INTO public.contact_activities (
          contact_id,
          activity_type,
          title,
          description,
          activity_data,
          created_by
        ) VALUES (
          NEW.id,
          'contact_updated',
          'Contacto actualizado',
          TRIM(change_description),
          jsonb_build_object(
            'changes', changes,
            'updated_by', auth.uid()
          ),
          auth.uid()
        );
      END IF;
    END;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

-- Create triggers for contact changes
CREATE TRIGGER contact_activity_logger
  AFTER INSERT OR UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_contact_activity();

-- Create function to log contact interactions
CREATE OR REPLACE FUNCTION public.log_contact_interaction_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Create triggers for contact interactions
CREATE TRIGGER contact_interaction_activity_logger
  AFTER INSERT ON public.contact_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_contact_interaction_activity();

-- Create function to log contact notes
CREATE OR REPLACE FUNCTION public.log_contact_note_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Create triggers for contact notes
CREATE TRIGGER contact_note_activity_logger
  AFTER INSERT ON public.contact_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.log_contact_note_activity();

-- Create function to log contact tasks
CREATE OR REPLACE FUNCTION public.log_contact_task_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Create triggers for contact tasks
CREATE TRIGGER contact_task_activity_logger
  AFTER INSERT OR UPDATE ON public.contact_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.log_contact_task_activity();