-- Fix Critical Database Security Issues
-- 1. Drop Security Definer Views (these bypass RLS)
DROP VIEW IF EXISTS public.user_profiles_with_roles CASCADE;
DROP VIEW IF EXISTS public.transaction_summary_view CASCADE;

-- 2. Fix Functions Missing Search Path (Security Issue)
-- Function: get_quantum_token
CREATE OR REPLACE FUNCTION public.get_quantum_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Obtener token desde variable de entorno
  RETURN current_setting('app.quantum_token', true);
END;
$function$;

-- Function: get_integraloop_config
CREATE OR REPLACE FUNCTION public.get_integraloop_config()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN jsonb_build_object(
    'subscription_key', current_setting('app.integraloop_subscription_key', true),
    'api_user', current_setting('app.integraloop_api_user', true),
    'api_password', current_setting('app.integraloop_api_password', true),
    'base_url', current_setting('app.integraloop_base_url', true)
  );
END;
$function$;

-- Function: obtener_token_integraloop
CREATE OR REPLACE FUNCTION public.obtener_token_integraloop()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN current_setting('app.integraloop_subscription_key', true);
END;
$function$;

-- Function: sincronizar_cuentas_quantum
CREATE OR REPLACE FUNCTION public.sincronizar_cuentas_quantum()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  quantum_token TEXT;
  company_id TEXT;
  request_id BIGINT;
  response_result RECORD; 
  response_content JSONB;
  cuenta_record RECORD;
  registros_procesados INT := 0;
BEGIN
  -- Obtener credenciales de forma segura
  quantum_token := current_setting('app.quantum_token', true);
  company_id := current_setting('app.company_id', true);
  
  IF quantum_token IS NULL OR company_id IS NULL THEN
    RETURN 'Error: Credenciales no configuradas. Configure app.quantum_token y app.company_id';
  END IF;

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
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error en sincronización: ' || SQLERRM;
END;
$function$;

-- Function: diagnostico_net_queue
CREATE OR REPLACE FUNCTION public.diagnostico_net_queue()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  pending_count INTEGER;
  failed_count INTEGER;
  recent_requests JSONB;
BEGIN
  -- Contar solicitudes pendientes
  SELECT COUNT(*) INTO pending_count
  FROM net.http_request_queue
  WHERE created_at > now() - interval '1 hour';
  
  -- Contar solicitudes fallidas recientes
  SELECT COUNT(*) INTO failed_count
  FROM net.http_request_queue
  WHERE created_at > now() - interval '1 hour'
  AND error_msg IS NOT NULL;
  
  -- Obtener solicitudes recientes
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'method', method,
      'url', url,
      'created_at', created_at,
      'error_msg', error_msg
    )
  ) INTO recent_requests
  FROM (
    SELECT id, method, url, created_at, error_msg
    FROM net.http_request_queue
    WHERE created_at > now() - interval '1 hour'
    ORDER BY created_at DESC
    LIMIT 10
  ) sub;
  
  RETURN jsonb_build_object(
    'pending_requests', pending_count,
    'failed_requests', failed_count,
    'recent_requests', COALESCE(recent_requests, '[]'::jsonb),
    'diagnosis_time', now()
  );
END;
$function$;

-- Function: set_environment_variables
CREATE OR REPLACE FUNCTION public.set_environment_variables(p_variables jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  key TEXT;
  value TEXT;
  current_user_role public.app_role;
BEGIN
  -- Verificar que el usuario sea superadmin
  SELECT public.get_user_highest_role(auth.uid()) INTO current_user_role;
  
  IF current_user_role != 'superadmin' THEN
    RAISE EXCEPTION 'Solo los superadministradores pueden configurar variables de entorno';
  END IF;
  
  -- Iterar sobre las variables y configurarlas
  FOR key, value IN SELECT * FROM jsonb_each_text(p_variables)
  LOOP
    -- Solo permitir variables específicas de configuración
    IF key NOT IN ('app.quantum_token', 'app.company_id', 'app.integraloop_subscription_key', 
                   'app.integraloop_api_user', 'app.integraloop_api_password', 'app.integraloop_base_url') THEN
      RAISE EXCEPTION 'Variable de entorno no permitida: %', key;
    END IF;
    
    -- Configurar la variable (esto requiere privilegios de superusuario en producción)
    PERFORM set_config(key, value, false);
  END LOOP;
  
  -- Registrar la acción de seguridad
  PERFORM public.log_security_event(
    'environment_variables_updated',
    'high',
    'Variables de entorno actualizadas por superadmin',
    jsonb_build_object('updated_keys', array_agg(key))
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    PERFORM public.log_security_event(
      'environment_variables_failed',
      'critical',
      'Error al actualizar variables de entorno: ' || SQLERRM,
      jsonb_build_object('error', SQLERRM)
    );
    RETURN false;
END;
$function$;

-- Function: validate_api_configuration
CREATE OR REPLACE FUNCTION public.validate_api_configuration()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  quantum_token TEXT;
  integraloop_key TEXT;
  result JSONB := '{}'::jsonb;
BEGIN
  -- Verificar configuración de Quantum
  quantum_token := current_setting('app.quantum_token', true);
  IF quantum_token IS NOT NULL AND length(quantum_token) > 10 THEN
    result := result || jsonb_build_object('quantum_configured', true);
  ELSE
    result := result || jsonb_build_object('quantum_configured', false);
  END IF;
  
  -- Verificar configuración de Integraloop
  integraloop_key := current_setting('app.integraloop_subscription_key', true);
  IF integraloop_key IS NOT NULL AND length(integraloop_key) > 10 THEN
    result := result || jsonb_build_object('integraloop_configured', true);
  ELSE
    result := result || jsonb_build_object('integraloop_configured', false);
  END IF;
  
  result := result || jsonb_build_object('validation_time', now());
  
  RETURN result;
END;
$function$;

-- Function: enforce_session_timeout
CREATE OR REPLACE FUNCTION public.enforce_session_timeout()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  timeout_minutes INTEGER := 240; -- 4 horas
  expired_sessions INTEGER;
BEGIN
  -- Contar sesiones que van a ser invalidadas
  SELECT COUNT(*) INTO expired_sessions
  FROM auth.sessions
  WHERE updated_at < now() - (timeout_minutes || ' minutes')::interval;
  
  -- Invalidar sesiones expiradas
  DELETE FROM auth.sessions
  WHERE updated_at < now() - (timeout_minutes || ' minutes')::interval;
  
  -- Registrar la acción
  IF expired_sessions > 0 THEN
    PERFORM public.log_security_event(
      'session_timeout_enforced',
      'medium',
      'Sesiones expiradas invalidadas automáticamente',
      jsonb_build_object('expired_count', expired_sessions, 'timeout_minutes', timeout_minutes)
    );
  END IF;
END;
$function$;

-- Function: create_security_audit_trail
CREATE OR REPLACE FUNCTION public.create_security_audit_trail(
  p_table_name text,
  p_operation text,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.security_logs (
    event_type,
    severity,
    description,
    metadata,
    user_id,
    ip_address
  ) VALUES (
    'data_audit',
    'info',
    'Operación de auditoría en tabla: ' || p_table_name,
    jsonb_build_object(
      'table_name', p_table_name,
      'operation', p_operation,
      'old_data', p_old_data,
      'new_data', p_new_data,
      'timestamp', now()
    ),
    auth.uid(),
    inet_client_addr()
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$function$;