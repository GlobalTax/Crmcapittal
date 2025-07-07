-- Eliminar funciones con credenciales hardcodeadas y recrearlas de forma segura
DROP FUNCTION IF EXISTS public.sincronizar_cuentas_quantum_final();
DROP FUNCTION IF EXISTS public.obtener_token_integraloop();
DROP FUNCTION IF EXISTS public.sincronizar_empresas_quantum();
DROP FUNCTION IF EXISTS public.sincronizar_clientes_quantum();
DROP FUNCTION IF EXISTS public.sincronizar_proveedores_quantum();
DROP FUNCTION IF EXISTS public.sincronizar_impuestos_quantum();
DROP FUNCTION IF EXISTS public.sincronizar_cuentas_quantum();

-- Crear función segura para sincronización de cuentas
CREATE OR REPLACE FUNCTION public.sincronizar_cuentas_quantum_segura()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Crear tabla para configuración segura de APIs
CREATE TABLE IF NOT EXISTS public.api_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_name TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- RLS para configuraciones de API
ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo administradores pueden gestionar configuraciones API" 
ON public.api_configurations FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role = ANY(ARRAY['admin'::app_role, 'superadmin'::app_role])
));

-- Insertar configuraciones base (sin credenciales)
INSERT INTO public.api_configurations (api_name, base_url) 
VALUES 
  ('quantum_economics', 'https://app.quantumeconomics.es'),
  ('einforma', 'https://api.einforma.com'),
  ('integraloop', 'https://api.integraloop.com')
ON CONFLICT (api_name) DO NOTHING;

-- Crear tabla para logs de seguridad
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para logs de seguridad
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo administradores pueden ver logs de seguridad" 
ON public.security_logs FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role = ANY(ARRAY['admin'::app_role, 'superadmin'::app_role])
));

CREATE POLICY "Sistema puede insertar logs de seguridad" 
ON public.security_logs FOR INSERT 
WITH CHECK (true);

-- Función para logging seguro
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_severity TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}',
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_logs (
    event_type,
    severity,
    description,
    metadata,
    user_id,
    ip_address
  ) VALUES (
    p_event_type,
    p_severity,
    p_description,
    p_metadata,
    p_user_id,
    inet_client_addr()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;