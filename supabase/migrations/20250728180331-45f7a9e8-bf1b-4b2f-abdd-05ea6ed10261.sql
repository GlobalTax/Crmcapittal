-- Correcciones de seguridad críticas
-- Fase 1: Corregir funciones con search_path mutable

-- 1. Función get_users_with_roles - agregar SET search_path
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
 RETURNS TABLE(user_id uuid, email text, role app_role, first_name text, last_name text, company text, phone text, is_manager boolean, manager_name text, manager_position text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH user_highest_roles AS (
    SELECT 
      ur.user_id,
      ur.role,
      ROW_NUMBER() OVER (
        PARTITION BY ur.user_id 
        ORDER BY 
          CASE ur.role
            WHEN 'superadmin' THEN 1
            WHEN 'admin' THEN 2
            WHEN 'user' THEN 3
          END
      ) as rn
    FROM user_roles ur
  )
  SELECT 
    u.id as user_id,
    u.email,
    uhr.role,
    up.first_name,
    up.last_name,
    up.company,
    up.phone,
    (om.id IS NOT NULL) as is_manager,
    om.name as manager_name,
    om.position as manager_position
  FROM auth.users u
  LEFT JOIN user_highest_roles uhr ON u.id = uhr.user_id AND uhr.rn = 1
  LEFT JOIN user_profiles up ON u.id = up.id
  LEFT JOIN operation_managers om ON u.id = om.user_id
  WHERE u.email IS NOT NULL
  ORDER BY uhr.role NULLS LAST, u.email;
$function$;

-- 2. Función is_admin_user - agregar SET search_path
CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  );
$function$;

-- 3. Función get_user_highest_role - agregar SET search_path
CREATE OR REPLACE FUNCTION public.get_user_highest_role(_user_id uuid)
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
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

-- 4. Función has_role - agregar SET search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- 5. Función has_role_secure - agregar SET search_path
CREATE OR REPLACE FUNCTION public.has_role_secure(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- 6. Función get_current_user_role_safe - agregar SET search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1;
$function$;

-- 7. Función get_quantum_token - agregar SET search_path
CREATE OR REPLACE FUNCTION public.get_quantum_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN current_setting('app.quantum_token', true);
END;
$function$;

-- 8. Función get_integraloop_config - agregar SET search_path
CREATE OR REPLACE FUNCTION public.get_integraloop_config()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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

-- Fase 2: Crear tabla para configuración de seguridad
CREATE TABLE IF NOT EXISTS public.security_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS en security_settings
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;

-- Política: Solo superadmins pueden gestionar configuración de seguridad
CREATE POLICY "Solo superadmins pueden gestionar configuración de seguridad"
ON public.security_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
);

-- Fase 3: Insertar configuraciones de seguridad por defecto
INSERT INTO public.security_settings (setting_key, setting_value, description) VALUES
  ('password_min_length', '8', 'Longitud mínima de contraseña'),
  ('password_require_uppercase', 'true', 'Requerir mayúsculas en contraseña'),
  ('password_require_lowercase', 'true', 'Requerir minúsculas en contraseña'),
  ('password_require_numbers', 'true', 'Requerir números en contraseña'),
  ('password_require_symbols', 'true', 'Requerir símbolos en contraseña'),
  ('max_login_attempts', '5', 'Máximo de intentos de login fallidos'),
  ('account_lockout_duration', '15', 'Duración de bloqueo de cuenta en minutos'),
  ('session_timeout', '60', 'Tiempo de expiración de sesión en minutos'),
  ('enable_2fa', 'false', 'Habilitar autenticación de dos factores'),
  ('rate_limit_requests_per_minute', '60', 'Límite de requests por minuto por IP')
ON CONFLICT (setting_key) DO NOTHING;

-- Fase 4: Función para validar fortaleza de contraseña
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  min_length integer;
  require_uppercase boolean;
  require_lowercase boolean;
  require_numbers boolean;
  require_symbols boolean;
  errors text[] := '{}';
  is_valid boolean := true;
BEGIN
  -- Obtener configuraciones de seguridad
  SELECT (setting_value::text)::integer INTO min_length
  FROM security_settings WHERE setting_key = 'password_min_length';
  
  SELECT (setting_value::text)::boolean INTO require_uppercase
  FROM security_settings WHERE setting_key = 'password_require_uppercase';
  
  SELECT (setting_value::text)::boolean INTO require_lowercase
  FROM security_settings WHERE setting_key = 'password_require_lowercase';
  
  SELECT (setting_value::text)::boolean INTO require_numbers
  FROM security_settings WHERE setting_key = 'password_require_numbers';
  
  SELECT (setting_value::text)::boolean INTO require_symbols
  FROM security_settings WHERE setting_key = 'password_require_symbols';
  
  -- Valores por defecto si no hay configuración
  min_length := COALESCE(min_length, 8);
  require_uppercase := COALESCE(require_uppercase, true);
  require_lowercase := COALESCE(require_lowercase, true);
  require_numbers := COALESCE(require_numbers, true);
  require_symbols := COALESCE(require_symbols, true);
  
  -- Validar longitud mínima
  IF length(password) < min_length THEN
    errors := array_append(errors, 'La contraseña debe tener al menos ' || min_length || ' caracteres');
    is_valid := false;
  END IF;
  
  -- Validar mayúsculas
  IF require_uppercase AND password !~ '[A-Z]' THEN
    errors := array_append(errors, 'La contraseña debe contener al menos una letra mayúscula');
    is_valid := false;
  END IF;
  
  -- Validar minúsculas
  IF require_lowercase AND password !~ '[a-z]' THEN
    errors := array_append(errors, 'La contraseña debe contener al menos una letra minúscula');
    is_valid := false;
  END IF;
  
  -- Validar números
  IF require_numbers AND password !~ '[0-9]' THEN
    errors := array_append(errors, 'La contraseña debe contener al menos un número');
    is_valid := false;
  END IF;
  
  -- Validar símbolos
  IF require_symbols AND password !~ '[^A-Za-z0-9]' THEN
    errors := array_append(errors, 'La contraseña debe contener al menos un símbolo especial');
    is_valid := false;
  END IF;
  
  RETURN jsonb_build_object(
    'is_valid', is_valid,
    'errors', to_jsonb(errors),
    'strength_score', CASE 
      WHEN array_length(errors, 1) IS NULL THEN 100
      ELSE GREATEST(0, 100 - (array_length(errors, 1) * 20))
    END
  );
END;
$function$;

-- Fase 5: Función mejorada de rate limiting con configuración dinámica
CREATE OR REPLACE FUNCTION public.check_rate_limit_enhanced(p_identifier text, p_action text DEFAULT 'general')
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  requests_per_minute integer;
  current_window timestamp with time zone;
  current_count integer;
  window_key text;
BEGIN
  -- Obtener límite de configuración
  SELECT (setting_value::text)::integer INTO requests_per_minute
  FROM security_settings WHERE setting_key = 'rate_limit_requests_per_minute';
  
  -- Valor por defecto
  requests_per_minute := COALESCE(requests_per_minute, 60);
  
  -- Crear ventana de tiempo (por minuto)
  current_window := date_trunc('minute', now());
  window_key := p_identifier || '_' || p_action;
  
  -- Insertar o actualizar contador
  INSERT INTO public.rate_limits (identifier, window_start, request_count)
  VALUES (window_key, current_window, 1)
  ON CONFLICT (identifier, window_start) 
  DO UPDATE SET 
    request_count = rate_limits.request_count + 1,
    created_at = now()
  RETURNING request_count INTO current_count;
  
  -- Limpiar ventanas antiguas (más de 1 hora)
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - interval '1 hour';
  
  -- Registrar si se excede el límite
  IF current_count > requests_per_minute THEN
    PERFORM log_security_event(
      'rate_limit_exceeded',
      'medium',
      'Rate limit exceeded for identifier: ' || p_identifier || ', action: ' || p_action,
      jsonb_build_object(
        'identifier', p_identifier,
        'action', p_action,
        'requests_count', current_count,
        'limit', requests_per_minute
      )
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

-- Fase 6: Trigger de seguridad para validar contraseñas (para futuras implementaciones)
CREATE OR REPLACE FUNCTION public.security_audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Registrar eventos de seguridad importantes
  IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'user_roles' THEN
    PERFORM log_security_event(
      'role_assigned',
      'high',
      'Role assigned to user',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'role', NEW.role,
        'assigned_by', auth.uid()
      )
    );
  END IF;
  
  IF TG_OP = 'DELETE' AND TG_TABLE_NAME = 'user_roles' THEN
    PERFORM log_security_event(
      'role_removed',
      'high',
      'Role removed from user',
      jsonb_build_object(
        'user_id', OLD.user_id,
        'role', OLD.role,
        'removed_by', auth.uid()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Crear triggers de auditoría de seguridad
DROP TRIGGER IF EXISTS security_audit_user_roles ON public.user_roles;
CREATE TRIGGER security_audit_user_roles
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.security_audit_trigger();

-- Fase 7: Función para obtener configuración de seguridad
CREATE OR REPLACE FUNCTION public.get_security_setting(p_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  setting_val text;
BEGIN
  SELECT setting_value::text INTO setting_val
  FROM security_settings
  WHERE setting_key = p_key;
  
  RETURN setting_val;
END;
$function$;

-- Fase 8: Crear índices para optimizar consultas de seguridad
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON public.security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON public.security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.rate_limits(window_start, identifier);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Registrar implementación de seguridad
INSERT INTO public.security_logs (
  event_type,
  severity,
  description,
  metadata,
  user_id
) VALUES (
  'security_hardening_implemented',
  'high',
  'Implementadas correcciones críticas de seguridad: search_path fixes, password validation, enhanced rate limiting',
  jsonb_build_object(
    'fixes_applied', jsonb_build_array(
      'search_path_set_to_public',
      'security_settings_table_created',
      'password_validation_function',
      'enhanced_rate_limiting',
      'security_audit_triggers',
      'optimized_indexes'
    ),
    'implementation_date', now()
  ),
  auth.uid()
);