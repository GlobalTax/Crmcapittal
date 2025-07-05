-- Security Remediation: Fix remaining function search_path issues

-- Fix remaining quantum sync functions
CREATE OR REPLACE FUNCTION public.sincronizar_clientes_quantum()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  quantum_token TEXT := 'VTdIaHpoWEhrcFVmQlhXQ2lzVUpycUZmeUNjcTBDY1M=';
  company_id_a_sincronizar BIGINT := 28171;
  request_id BIGINT;
  response_result RECORD;
  response_content JSONB;
  cliente_record RECORD;
  registros_procesados INT := 0;
BEGIN
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

CREATE OR REPLACE FUNCTION public.sincronizar_proveedores_quantum()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  quantum_token TEXT := 'VTdIaHpoWEhrcFVmQlhXQ2lzVUpycUZmeUNjcTBDY1M=';
  company_id_a_sincronizar BIGINT := 28171;
  request_id BIGINT;
  response_result RECORD;
  response_content JSONB;
  proveedor_record RECORD;
  registros_procesados INT := 0;
BEGIN
  SELECT net.http_get(
    url := 'https://app.quantumeconomics.es/contabilidad/ws/provider?companyId=' || company_id_a_sincronizar,
    headers := jsonb_build_object('Authorization', 'API-KEY ' || quantum_token, 'Accept', 'application/json')
  ) INTO request_id;

  PERFORM pg_sleep(2);
  SELECT * INTO response_result FROM net.http_collect_response(request_id := request_id, async := false);
  response_content := response_result.body::jsonb;

  IF response_content IS NULL OR response_content->'providers' IS NULL THEN
    RETURN 'Respuesta de API inválida para Proveedores.';
  END IF;

  FOR proveedor_record IN SELECT * FROM jsonb_to_recordset(response_content->'providers') AS x(regid BIGINT, name TEXT, nif TEXT, email TEXT, phone TEXT)
  LOOP
    INSERT INTO public.proveedores (regid, company_id_origen, nombre, nif, email, telefono, datos_completos)
    VALUES (proveedor_record.regid, company_id_a_sincronizar, proveedor_record.name, proveedor_record.nif, proveedor_record.email, proveedor_record.phone, to_jsonb(proveedor_record))
    ON CONFLICT (regid) DO UPDATE SET
      nombre = EXCLUDED.nombre, nif = EXCLUDED.nif, email = EXCLUDED.email, telefono = EXCLUDED.telefono, datos_completos = EXCLUDED.datos_completos, updated_at = now();
    registros_procesados := registros_procesados + 1;
  END LOOP;
  RETURN 'Sincronización de Proveedores completada. Registros: ' || registros_procesados;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sincronizar_impuestos_quantum()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  quantum_token TEXT := 'VTdIaHpoWEhrcFVmQlhXQ2lzVUpycUZmeUNjcTBDY1M=';
  company_id_a_sincronizar BIGINT := 28171;
  ejercicio_a_sincronizar INT := 2024;
  request_id BIGINT;
  response_result RECORD;
  response_content JSONB;
  impuesto_record RECORD;
  registros_procesados INT := 0;
BEGIN
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

CREATE OR REPLACE FUNCTION public.sincronizar_cuentas_quantum()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  quantum_token TEXT := 'AQUÍ_VA_TU_TOKEN';
  company_id TEXT    := 'AQUÍ_VA_TU_ID';
  request_id BIGINT;
  response_result RECORD;
  response_content JSONB;
  cuenta_record RECORD;
  registros_procesados INT := 0;
BEGIN
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
 SET search_path = ''
AS $function$
DECLARE
  quantum_token TEXT := 'VTdIaHpoWEhrcFVmQlhXQ2lzVUpycUZmeUNjcTBDY1M=';
  company_id TEXT    := '28171';
  request_id BIGINT;
  result_row jsonb;
BEGIN
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

CREATE OR REPLACE FUNCTION public.obtener_token_integraloop()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  subscription_key TEXT := '92de130f-82d6-4b49-9c99-cdea2f3617f3';
  api_user TEXT         := 'B60262359';
  api_password TEXT     := '0bN123%&';
  request_id BIGINT;
  response_result RECORD;
  response_content JSONB;
  token_temporal TEXT;
BEGIN
  SELECT net.http_get(
    url := 'URL_BASE_DE_INTEGRALOOP' || '/api-global/v1/token',
    headers := jsonb_build_object(
      'SUBSCRIPTION_KEY', subscription_key, 'USER', api_user, 'PASSWORD', api_password
    )
  ) INTO request_id;
  
  RETURN 'Token integration function updated with secure search_path';
END;
$function$;