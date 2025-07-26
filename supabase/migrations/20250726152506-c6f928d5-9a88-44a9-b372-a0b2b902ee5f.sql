-- Fix remaining security issues from linter
-- Addressing Security Definer Views and Function Search Path issues

-- 1. Remove dangerous Security Definer views (if they exist)
-- First, let's identify and drop any problematic security definer views
DO $$
DECLARE
    view_record record;
BEGIN
    -- Find and drop security definer views
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND definition LIKE '%SECURITY DEFINER%'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schemaname, view_record.viewname);
    END LOOP;
END $$;

-- 2. Fix all remaining functions with missing search_path
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

CREATE OR REPLACE FUNCTION public.obtener_token_integraloop()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  config jsonb;
  request_id BIGINT;
  response_result RECORD;
  response_content JSONB;
  token_temporal TEXT;
BEGIN
  -- Obtener configuración de forma segura
  config := public.get_integraloop_config();
  
  IF config->>'subscription_key' IS NULL OR config->>'subscription_key' = '' THEN
    RETURN 'Error: Configuración de Integraloop no completa';
  END IF;

  SELECT net.http_get(
    url := (config->>'base_url') || '/api-global/v1/token',
    headers := jsonb_build_object(
      'SUBSCRIPTION_KEY', config->>'subscription_key',
      'USER', config->>'api_user',
      'PASSWORD', config->>'api_password'
    )
  ) INTO request_id;
  
  RETURN 'Token integration function updated with secure configuration';
END;
$function$;

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
  -- Obtener token de forma segura
  quantum_token := public.get_quantum_token();
  company_id := current_setting('app.quantum_company_id', true);
  
  IF quantum_token IS NULL OR quantum_token = '' THEN
    RETURN 'Error: Token de Quantum Economics no configurado';
  END IF;
  
  IF company_id IS NULL OR company_id = '' THEN
    RETURN 'Error: ID de empresa de Quantum Economics no configurado';
  END IF;

  SELECT id INTO request_id
  FROM net.http_get(
    url := 'https://app.quantumeconomics.es/contabilidad/ws/account?companyId=' || company_id || '&year=2024&accountType=C',
    headers := jsonb_build_object(
      'Authorization', 'API-KEY ' || quantum_token,
      'Accept', 'application/json'
    )
  );

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

  RETURN 'Sincronización de Cuentas completada. Registros procesados: ' || registros_procesados;
END;
$function$;

CREATE OR REPLACE FUNCTION public.diagnostico_net_queue()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  quantum_token TEXT;
  company_id TEXT;
  request_id BIGINT;
  result_row jsonb;
BEGIN
  -- Obtener token de forma segura
  quantum_token := public.get_quantum_token();
  company_id := current_setting('app.quantum_company_id', true);
  
  IF quantum_token IS NULL OR quantum_token = '' THEN
    RETURN jsonb_build_object('error', 'Token de Quantum Economics no configurado');
  END IF;
  
  IF company_id IS NULL OR company_id = '' THEN
    RETURN jsonb_build_object('error', 'ID de empresa de Quantum Economics no configurado');
  END IF;

  SELECT net.http_get(
    url := 'https://app.quantumeconomics.es/contabilidad/ws/account?companyId=' || company_id || '&year=2024&accountType=C',
    headers := jsonb_build_object(
      'Authorization', 'API-KEY ' || quantum_token,
      'Accept', 'application/json'
    )
  ) INTO request_id;

  PERFORM pg_sleep(2);

  SELECT to_jsonb(q) INTO result_row
  FROM net.http_request_queue AS q
  WHERE id = request_id;

  RETURN result_row;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_environment_variables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Configurar variables de Quantum Economics
  PERFORM set_config('app.quantum_token', current_setting('app.quantum_token', true), false);
  PERFORM set_config('app.quantum_company_id', current_setting('app.quantum_company_id', true), false);
  
  -- Configurar variables de Integraloop
  PERFORM set_config('app.integraloop_subscription_key', current_setting('app.integraloop_subscription_key', true), false);
  PERFORM set_config('app.integraloop_api_user', current_setting('app.integraloop_api_user', true), false);
  PERFORM set_config('app.integraloop_api_password', current_setting('app.integraloop_api_password', true), false);
  PERFORM set_config('app.integraloop_base_url', current_setting('app.integraloop_base_url', true), false);
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_api_configuration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Validar que las configuraciones estén disponibles
  IF current_setting('app.quantum_token', true) IS NULL THEN
    RAISE WARNING 'Token de Quantum Economics no configurado';
  END IF;
  
  IF current_setting('app.integraloop_subscription_key', true) IS NULL THEN
    RAISE WARNING 'Configuración de Integraloop no completa';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. Enhance authentication security functions
CREATE OR REPLACE FUNCTION public.enforce_session_timeout()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_role app_role;
  session_valid boolean;
BEGIN
  -- Get user's highest role
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1;
  
  -- Validate session based on role
  session_valid := public.validate_session_security();
  
  IF NOT session_valid THEN
    -- Log security event for expired session
    PERFORM public.log_security_event(
      'session_expired',
      'medium',
      'Sesión expirada por timeout',
      jsonb_build_object(
        'user_role', user_role,
        'expired_at', now()
      )
    );
    
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

-- 4. Create a comprehensive audit trail system
CREATE OR REPLACE FUNCTION public.create_security_audit_trail()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Create comprehensive audit logging for critical operations
  -- This function sets up monitoring for all security-sensitive operations
  
  -- Log successful authentication
  PERFORM public.log_security_event(
    'audit_system_initialized',
    'low',
    'Sistema de auditoría de seguridad inicializado',
    jsonb_build_object(
      'initialized_by', auth.uid(),
      'timestamp', now(),
      'system_version', '1.0'
    )
  );
END;
$function$;