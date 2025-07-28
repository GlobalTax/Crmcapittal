-- Fix all remaining functions without search_path

CREATE OR REPLACE FUNCTION public.log_company_activity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Handle INSERT (company created)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.company_activities (
      company_id,
      activity_type,
      title,
      description,
      activity_data,
      created_by
    ) VALUES (
      NEW.id,
      'company_created',
      'Empresa creada',
      'Se ha creado una nueva empresa en el sistema',
      jsonb_build_object(
        'company_name', NEW.name,
        'company_status', NEW.company_status,
        'company_type', NEW.company_type
      ),
      NEW.created_by
    );
    RETURN NEW;
  END IF;

  -- Handle UPDATE (company modified)
  IF TG_OP = 'UPDATE' THEN
    DECLARE
      changes jsonb := '{}'::jsonb;
      change_description text := '';
    BEGIN
      -- Track name changes
      IF OLD.name != NEW.name THEN
        changes := changes || jsonb_build_object('name', jsonb_build_object('from', OLD.name, 'to', NEW.name));
        change_description := change_description || 'Nombre cambiado. ';
      END IF;
      
      -- Track status changes
      IF OLD.company_status != NEW.company_status THEN
        changes := changes || jsonb_build_object('status', jsonb_build_object('from', OLD.company_status, 'to', NEW.company_status));
        change_description := change_description || 'Estado cambiado. ';
      END IF;
      
      -- Only log if there are actual changes
      IF changes != '{}'::jsonb THEN
        INSERT INTO public.company_activities (
          company_id,
          activity_type,
          title,
          description,
          activity_data,
          created_by
        ) VALUES (
          NEW.id,
          'company_updated',
          'Empresa actualizada',
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

CREATE OR REPLACE FUNCTION public.log_contact_activity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
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
      -- Track field changes (simplified for migration size)
      IF OLD.name != NEW.name THEN
        changes := changes || jsonb_build_object('name', jsonb_build_object('from', OLD.name, 'to', NEW.name));
        change_description := change_description || 'Nombre cambiado. ';
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

CREATE OR REPLACE FUNCTION public.calculate_time_entry_duration()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_case_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
    NEW.case_number := 'EXP-' || TO_CHAR(now(), 'YYYY') || '-' || 
                       LPAD(NEXTVAL('case_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_transaction_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.transaction_code IS NULL THEN
    NEW.transaction_code := 'TXN-' || TO_CHAR(now(), 'YYYY') || '-' || 
                           LPAD(NEXTVAL('transaction_code_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_lead_score(p_lead_id uuid, p_points_to_add integer)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.lead_nurturing (lead_id, lead_score, updated_at)
  VALUES (p_lead_id, p_points_to_add, now())
  ON CONFLICT (lead_id) 
  DO UPDATE SET 
    lead_score = lead_nurturing.lead_score + p_points_to_add,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.update_planned_task_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- When a time entry is started (end_time is null), mark planned task as IN_PROGRESS
  IF NEW.planned_task_id IS NOT NULL AND NEW.end_time IS NULL THEN
    UPDATE public.planned_tasks
    SET status = 'IN_PROGRESS', updated_at = now()
    WHERE id = NEW.planned_task_id AND status = 'PENDING';
  END IF;
  
  -- When a time entry is completed (end_time is set), check if we should mark task as COMPLETED
  IF NEW.planned_task_id IS NOT NULL AND NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
    -- Only mark as completed if there are no other active time entries for this task
    IF NOT EXISTS (
      SELECT 1 FROM public.time_entries 
      WHERE planned_task_id = NEW.planned_task_id 
      AND end_time IS NULL 
      AND id != NEW.id
    ) THEN
      UPDATE public.planned_tasks
      SET status = 'COMPLETED', updated_at = now()
      WHERE id = NEW.planned_task_id AND status = 'IN_PROGRESS';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;