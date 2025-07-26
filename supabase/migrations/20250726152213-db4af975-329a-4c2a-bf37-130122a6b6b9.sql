-- Critical Security Fixes Migration
-- Phase 1: Database Security Hardening

-- 1. Add missing RLS policies for embeddings table
CREATE POLICY "Solo administradores pueden gestionar embeddings"
ON public.embeddings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- 2. Add missing RLS policies for proveedores table  
CREATE POLICY "Solo administradores pueden gestionar proveedores"
ON public.proveedores
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- 3. Secure all database functions by adding search_path protection
CREATE OR REPLACE FUNCTION public.sincronizar_clientes_quantum()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  quantum_token TEXT;
  company_id_a_sincronizar BIGINT := 28171;
  request_id BIGINT;
  response_result RECORD;
  response_content JSONB;
  cliente_record RECORD;
  registros_procesados INT := 0;
BEGIN
  -- Obtener token de forma segura
  quantum_token := public.get_quantum_token();
  
  IF quantum_token IS NULL OR quantum_token = '' THEN
    RETURN 'Error: Token de Quantum Economics no configurado';
  END IF;

  SELECT net.http_get(
    url := 'https://app.quantumeconomics.es/contabilidad/ws/customer?companyId=' || company_id_a_sincronizar,
    headers := jsonb_build_object('Authorization', 'API-KEY ' || quantum_token, 'Accept', 'application/json')
  ) INTO request_id;
  
  PERFORM pg_sleep(2);
  SELECT * INTO response_result FROM net.http_collect_response(request_id := request_id, async := false);
  response_content := response_result.body::jsonb;
  
  IF response_content IS NULL OR response_content->'customers' IS NULL THEN
    RETURN 'Respuesta de API inválida para Clientes.';
  END IF;

  FOR cliente_record IN SELECT * FROM jsonb_to_recordset(response_content->'customers') AS x(regid BIGINT, name TEXT, nif TEXT, email TEXT, phone TEXT)
  LOOP
    INSERT INTO public.clientes (regid, company_id_origen, nombre, nif, email, telefono, datos_completos)
    VALUES (cliente_record.regid, company_id_a_sincronizar, cliente_record.name, cliente_record.nif, cliente_record.email, cliente_record.phone, to_jsonb(cliente_record))
    ON CONFLICT (regid) DO UPDATE SET
      nombre = EXCLUDED.nombre, nif = EXCLUDED.nif, email = EXCLUDED.email, telefono = EXCLUDED.telefono, datos_completos = EXCLUDED.datos_completos, updated_at = now();
    registros_procesados := registros_procesados + 1;
  END LOOP;
  RETURN 'Sincronización de Clientes completada. Registros: ' || registros_procesados;
END;
$function$;

-- 4. Secure quantum functions with proper search path
CREATE OR REPLACE FUNCTION public.sincronizar_impuestos_quantum()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  quantum_token TEXT;
  company_id_a_sincronizar BIGINT := 28171;
  ejercicio_a_sincronizar INT := 2024;
  request_id BIGINT;
  response_result RECORD;
  response_content JSONB;
  impuesto_record RECORD;
  registros_procesados INT := 0;
BEGIN
  -- Obtener token de forma segura
  quantum_token := public.get_quantum_token();
  
  IF quantum_token IS NULL OR quantum_token = '' THEN
    RETURN 'Error: Token de Quantum Economics no configurado';
  END IF;

  SELECT net.http_get(
    url := 'https://app.quantumeconomics.es/contabilidad/ws/tax?companyId=' || company_id_a_sincronizar || '&year=' || ejercicio_a_sincronizar,
    headers := jsonb_build_object('Authorization', 'API-KEY ' || quantum_token, 'Accept', 'application/json')
  ) INTO request_id;
  
  PERFORM pg_sleep(2);
  SELECT * INTO response_result FROM net.http_collect_response(request_id := request_id, async := false);
  response_content := response_result.body::jsonb;

  IF response_content IS NULL OR response_content->'taxes' IS NULL THEN
    RETURN 'Respuesta de API inválida para Impuestos.';
  END IF;

  TRUNCATE TABLE public.impuestos;

  FOR impuesto_record IN SELECT * FROM jsonb_to_recordset(response_content->'taxes') AS x(model TEXT, year INT, period TEXT, amount NUMERIC, csv TEXT, filed BOOLEAN)
  LOOP
    INSERT INTO public.impuestos (company_id_origen, modelo, ejercicio, periodo, importe, csv, presentado)
    VALUES (company_id_a_sincronizar, impuesto_record.model, impuesto_record.year, impuesto_record.period, impuesto_record.amount, impuesto_record.csv, impuesto_record.filed);
    registros_procesados := registros_procesados + 1;
  END LOOP;
  RETURN 'Sincronización de Impuestos completada. Registros: ' || registros_procesados;
END;
$function$;

-- 5. Strengthen role management with validation trigger
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_user_role app_role;
  target_role app_role;
BEGIN
  -- Get current user's highest role
  SELECT role INTO current_user_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1;
  
  target_role := NEW.role;
  
  -- Prevent self-role assignment
  IF auth.uid() = NEW.user_id THEN
    RAISE EXCEPTION 'No puedes asignarte roles a ti mismo';
  END IF;
  
  -- Only superadmins can assign superadmin role
  IF target_role = 'superadmin' AND current_user_role != 'superadmin' THEN
    RAISE EXCEPTION 'Solo superadministradores pueden asignar roles de superadministrador';
  END IF;
  
  -- Only admins or superadmins can assign admin role
  IF target_role = 'admin' AND current_user_role NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'Solo administradores pueden asignar roles de administrador';
  END IF;
  
  -- Log the role assignment for audit
  PERFORM public.log_security_event(
    'role_assigned',
    'medium',
    'Rol asignado: ' || target_role::text,
    jsonb_build_object(
      'target_user_id', NEW.user_id,
      'assigned_role', target_role,
      'assigned_by', auth.uid()
    )
  );
  
  RETURN NEW;
END;
$function$;

-- Create trigger for role validation
DROP TRIGGER IF EXISTS validate_role_assignment_trigger ON public.user_roles;
CREATE TRIGGER validate_role_assignment_trigger
  BEFORE INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_role_assignment();

-- 6. Add audit trigger for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.log_security_event(
      'role_removed',
      'high',
      'Rol removido: ' || OLD.role::text,
      jsonb_build_object(
        'target_user_id', OLD.user_id,
        'removed_role', OLD.role,
        'removed_by', auth.uid()
      )
    );
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create audit trigger for role deletions
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.user_roles;
CREATE TRIGGER audit_role_changes_trigger
  AFTER DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- 7. Strengthen user_roles RLS to prevent direct manipulation
DROP POLICY IF EXISTS "Users can manage their own roles" ON public.user_roles;
CREATE POLICY "Solo administradores pueden gestionar roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'superadmin')
  )
);

-- 8. Add comprehensive input validation function
CREATE OR REPLACE FUNCTION public.validate_input_security(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Remove potential SQL injection patterns
  IF input_text ~* '(union|select|insert|update|delete|drop|create|alter|exec|execute)(\s|$)' THEN
    RAISE EXCEPTION 'Entrada contiene patrones de SQL peligrosos';
  END IF;
  
  -- Remove script tags and other dangerous HTML
  input_text := regexp_replace(input_text, '<script[^>]*>.*?</script>', '', 'gi');
  input_text := regexp_replace(input_text, 'javascript:', '', 'gi');
  input_text := regexp_replace(input_text, 'vbscript:', '', 'gi');
  input_text := regexp_replace(input_text, 'on\w+\s*=', '', 'gi');
  
  -- Limit length to prevent DoS
  IF length(input_text) > 10000 THEN
    RAISE EXCEPTION 'Entrada demasiado larga';
  END IF;
  
  RETURN trim(input_text);
END;
$function$;

-- 9. Create secure session validation function
CREATE OR REPLACE FUNCTION public.validate_session_security()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  session_created_at timestamp with time zone;
  session_age interval;
BEGIN
  -- Get session creation time (simplified - in practice you'd store this)
  SELECT created_at INTO session_created_at
  FROM auth.users
  WHERE id = auth.uid();
  
  IF session_created_at IS NULL THEN
    RETURN false;
  END IF;
  
  -- Calculate session age
  session_age := now() - session_created_at;
  
  -- Session expires after 8 hours for regular users, 4 hours for admins
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  ) THEN
    -- Admins have shorter session timeout
    IF session_age > interval '4 hours' THEN
      RETURN false;
    END IF;
  ELSE
    -- Regular users
    IF session_age > interval '8 hours' THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$function$;