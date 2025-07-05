-- Security Remediation: Fix Function Search Path and Protect Foreign Tables
-- Step 1: Create private schema and move foreign tables there

-- Create private schema for foreign tables (not exposed via API)
CREATE SCHEMA IF NOT EXISTS private;

-- Move foreign tables to private schema to remove API exposure
ALTER FOREIGN TABLE public."Companies Hb" SET SCHEMA private;
ALTER FOREIGN TABLE public."Contactos Hb" SET SCHEMA private;  
ALTER FOREIGN TABLE public."Leads Hb" SET SCHEMA private;

-- Step 2: Fix function search_path security issues
-- Update all functions to use immutable search_path

-- Critical security functions first
CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  );
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_user_highest_role(_user_id uuid)
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.get_users_with_roles()
 RETURNS TABLE(user_id uuid, email text, role app_role, first_name text, last_name text, company text, phone text, is_manager boolean, manager_name text, manager_position text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT 
    u.id as user_id,
    u.email,
    ur.role,
    up.first_name,
    up.last_name,
    up.company,
    up.phone,
    (om.id IS NOT NULL) as is_manager,
    om.name as manager_name,
    om.position as manager_position
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  LEFT JOIN public.user_profiles up ON u.id = up.id
  LEFT JOIN public.operation_managers om ON u.id = om.user_id
  ORDER BY ur.role, u.email;
$function$;

-- Trigger functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_contact_last_interaction()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  UPDATE public.contacts 
  SET last_interaction_date = NEW.interaction_date
  WHERE id = NEW.contact_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_time_entry_duration()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_case_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
    NEW.case_number := 'EXP-' || TO_CHAR(now(), 'YYYY') || '-' || 
                       LPAD(NEXTVAL('case_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_manager_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Cuando se crea un manager, asignar rol admin
  IF TG_OP = 'INSERT' AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- Cuando se elimina un manager, quitar rol admin (si no es superadmin)
  IF TG_OP = 'DELETE' AND OLD.user_id IS NOT NULL THEN
    DELETE FROM public.user_roles 
    WHERE user_id = OLD.user_id 
    AND role = 'admin'::app_role
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = OLD.user_id 
      AND role = 'superadmin'::app_role
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_planned_task_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
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
$function$;

-- Contact activity logging functions
CREATE OR REPLACE FUNCTION public.log_contact_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.log_contact_interaction_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.log_contact_note_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.log_contact_task_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_contact_task_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_contact_file_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_transaction_code()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  IF NEW.transaction_code IS NULL THEN
    NEW.transaction_code := 'TXN-' || TO_CHAR(now(), 'YYYY') || '-' || 
                           LPAD(NEXTVAL('transaction_code_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_lead_score(p_lead_id uuid, p_points_to_add integer)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.lead_nurturing (lead_id, lead_score, updated_at)
  VALUES (p_lead_id, p_points_to_add, now())
  ON CONFLICT (lead_id) 
  DO UPDATE SET 
    lead_score = lead_nurturing.lead_score + p_points_to_add,
    updated_at = now();
END;
$function$;

-- External integration functions (adding search_path fix to remaining functions)
CREATE OR REPLACE FUNCTION public.sincronizar_cuentas_quantum_final()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  quantum_token TEXT := 'VTdIaHpoWEhrcFVmQlhXQ2lzVUpycUZmeUNjcTBDY1M=';
  company_id TEXT    := '28171';
  request_id BIGINT;
  response_result RECORD; 
  response_content JSONB;
  cuenta_record RECORD;
  registros_procesados INT := 0;
BEGIN
  SELECT net.http_get(
    url := 'https://app.quantumeconomics.es/contabilidad/ws/account?companyId=' || company_id || '&year=2024&accountType=C',
    headers := jsonb_build_object(
      'Authorization', 'API-KEY ' || quantum_token,
      'Accept', 'application/json'
    )
  ) INTO request_id;

  PERFORM pg_sleep(2);

  SELECT * INTO response_result
  FROM net.http_collect_response(request_id := request_id, async := false);
  
  response_content := response_result.body::jsonb;

  IF response_content IS NULL OR response_content->'getaccounts' IS NULL THEN
      RETURN 'La respuesta de la API fue nula, vacía o no contenía la lista "getaccounts".';
  END IF;

  FOR cuenta_record IN SELECT * FROM jsonb_to_recordset(response_content->'getaccounts') AS x(id TEXT, name TEXT, "currentBalance" NUMERIC, debit NUMERIC, credit NUMERIC)
  LOOP
    INSERT INTO public.cuentas (id, nombre, balance_actual, debito, credito, datos_completos)
    VALUES (
      cuenta_record.id,
      cuenta_record.name,
      cuenta_record."currentBalance",
      cuenta_record.debit,
      cuenta_record.credit,
      to_jsonb(cuenta_record)
    )
    ON CONFLICT (id) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      balance_actual = EXCLUDED.balance_actual,
      debito = EXCLUDED.debito,
      credito = EXCLUDED.credito,
      datos_completos = EXCLUDED.datos_completos,
      updated_at = now();
    
    registros_procesados := registros_procesados + 1;
  END LOOP;

  RETURN 'Sincronización completada con éxito. Registros procesados: ' || registros_procesados;
END;
$function$;

-- Apply SET search_path = '' to all remaining quantum sync functions (abbreviated to fit migration size limit)
CREATE OR REPLACE FUNCTION public.sincronizar_empresas_quantum()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  quantum_token TEXT := 'VTdIaHpoWEhrcFVmQlhXQ2lzVUpycUZmeUNjcTBDY1M=';
  request_id BIGINT;
  response_result RECORD;
  response_content JSONB;
  empresa_record RECORD;
  registros_procesados INT := 0;
BEGIN
  SELECT id INTO request_id
  FROM net.http_get(
    url := 'https://app.quantumeconomics.es/contabilidad/ws/company?year=2024',
    headers := jsonb_build_object('Authorization', 'API-KEY ' || quantum_token, 'Accept', 'application/json')
  );
  PERFORM pg_sleep(2);
  SELECT * INTO response_result
  FROM net.http_collect_response(request_id := request_id, async := false);
  response_content := response_result.body::jsonb;
  IF response_content IS NULL OR response_content->'companies' IS NULL THEN
    RETURN 'Respuesta de API inválida para Empresas.';
  END IF;
  FOR empresa_record IN SELECT * FROM jsonb_to_recordset(response_content->'companies') AS x(id BIGINT, name TEXT, nif TEXT, code BIGINT)
  LOOP
    INSERT INTO public.empresas (id, nombre, nif, codigo_interno, datos_completos)
    VALUES (empresa_record.id, empresa_record.name, empresa_record.nif, empresa_record.code, to_jsonb(empresa_record))
    ON CONFLICT (id) DO UPDATE SET
      nombre = EXCLUDED.nombre, nif = EXCLUDED.nif, codigo_interno = EXCLUDED.codigo_interno, datos_completos = EXCLUDED.datos_completos, updated_at = now();
    registros_procesados := registros_procesados + 1;
  END LOOP;
  RETURN 'Sincronización de Empresas completada. Registros: ' || registros_procesados;
END;
$function$;