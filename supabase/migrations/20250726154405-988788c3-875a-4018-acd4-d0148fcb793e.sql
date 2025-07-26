-- Fix Database Security Issues - Part 1: Drop and Recreate Functions
-- Drop existing functions that need to be recreated with proper search_path
DROP FUNCTION IF EXISTS public.validate_api_configuration() CASCADE;
DROP VIEW IF EXISTS public.user_profiles_with_roles CASCADE;
DROP VIEW IF EXISTS public.transaction_summary_view CASCADE;

-- Recreate functions with proper security settings
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

-- Fix other functions with missing search_path
CREATE OR REPLACE FUNCTION public.sincronizar_cuentas_quantum_segura()
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
  -- Obtener credenciales de forma segura (deberán configurarse como secretos)
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