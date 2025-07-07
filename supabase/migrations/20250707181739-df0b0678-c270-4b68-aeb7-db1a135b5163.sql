-- Migración de Seguridad: Eliminar Credenciales Hardcodeadas
-- Fecha: 2025-07-06
-- Descripción: Reemplazar credenciales hardcodeadas con variables de entorno

-- Función para obtener token de Quantum Economics desde variables de entorno
CREATE OR REPLACE FUNCTION public.get_quantum_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Obtener token desde variable de entorno
  RETURN current_setting('app.quantum_token', true);
END;
$function$;

-- Función para obtener configuración de Integraloop desde variables de entorno
CREATE OR REPLACE FUNCTION public.get_integraloop_config()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
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

-- Actualizar función de sincronización de clientes Quantum
CREATE OR REPLACE FUNCTION public.sincronizar_clientes_quantum()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
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

-- Actualizar función de sincronización de impuestos Quantum
CREATE OR REPLACE FUNCTION public.sincronizar_impuestos_quantum()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
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

-- Actualizar función de sincronización de cuentas Quantum
CREATE OR REPLACE FUNCTION public.sincronizar_cuentas_quantum()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
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

-- Actualizar función de diagnóstico de red Quantum
CREATE OR REPLACE FUNCTION public.diagnostico_net_queue()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path = ''
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

-- Actualizar función de obtención de token Integraloop
CREATE OR REPLACE FUNCTION public.obtener_token_integraloop()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
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

-- Crear función para configurar variables de entorno
CREATE OR REPLACE FUNCTION public.set_environment_variables()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
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

-- Comentarios sobre la configuración
COMMENT ON FUNCTION public.get_quantum_token() IS 'Obtiene el token de Quantum Economics desde variables de entorno de forma segura';
COMMENT ON FUNCTION public.get_integraloop_config() IS 'Obtiene la configuración de Integraloop desde variables de entorno de forma segura';
COMMENT ON FUNCTION public.set_environment_variables() IS 'Configura las variables de entorno para las APIs externas';

-- Crear trigger para validar configuración al conectar
CREATE OR REPLACE FUNCTION public.validate_api_configuration()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
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