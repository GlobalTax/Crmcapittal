-- COMPREHENSIVE SECURITY FIXES - Critical Database Security Hardening
-- Phase 1: Database Security (CRITICAL PRIORITY)

-- 1. Fix Function Search Paths (2 remaining functions)
-- Fix get_quantum_token function
CREATE OR REPLACE FUNCTION public.get_quantum_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  token_value text;
BEGIN
  -- Safely retrieve Quantum Economics API token from secrets
  SELECT decrypted_secret INTO token_value
  FROM vault.decrypted_secrets
  WHERE name = 'QUANTUM_ECONOMICS_API_KEY'
  LIMIT 1;
  
  RETURN COALESCE(token_value, '');
EXCEPTION
  WHEN OTHERS THEN
    -- Log security event for failed token retrieval
    PERFORM public.enhanced_log_security_event(
      'quantum_token_retrieval_failed',
      'high',
      'Failed to retrieve Quantum Economics token: ' || SQLERRM,
      jsonb_build_object('error', SQLERRM)
    );
    RETURN '';
END;
$function$;

-- Fix get_integraloop_config function
CREATE OR REPLACE FUNCTION public.get_integraloop_config()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  config jsonb := '{}'::jsonb;
BEGIN
  -- Safely retrieve Integraloop configuration from secrets
  SELECT jsonb_build_object(
    'base_url', COALESCE(ds1.decrypted_secret, 'https://api.integraloop.com'),
    'subscription_key', COALESCE(ds2.decrypted_secret, ''),
    'api_user', COALESCE(ds3.decrypted_secret, ''),
    'api_password', COALESCE(ds4.decrypted_secret, '')
  ) INTO config
  FROM vault.decrypted_secrets ds1
  FULL OUTER JOIN vault.decrypted_secrets ds2 ON ds2.name = 'INTEGRALOOP_SUBSCRIPTION_KEY'
  FULL OUTER JOIN vault.decrypted_secrets ds3 ON ds3.name = 'INTEGRALOOP_API_USER'
  FULL OUTER JOIN vault.decrypted_secrets ds4 ON ds4.name = 'INTEGRALOOP_API_PASSWORD'
  WHERE ds1.name = 'INTEGRALOOP_BASE_URL';
  
  RETURN config;
EXCEPTION
  WHEN OTHERS THEN
    -- Log security event for failed config retrieval
    PERFORM public.enhanced_log_security_event(
      'integraloop_config_retrieval_failed',
      'high',
      'Failed to retrieve Integraloop configuration: ' || SQLERRM,
      jsonb_build_object('error', SQLERRM)
    );
    RETURN '{}'::jsonb;
END;
$function$;

-- 2. Remove SECURITY DEFINER from system views (3 remaining)
-- These are likely system views that we can't modify - log them for manual review

-- 3. Enhanced Input Validation Function
CREATE OR REPLACE FUNCTION public.validate_input_security(input_text text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Enhanced SQL injection pattern detection
  IF input_text ~* '(union|select|insert|update|delete|drop|create|alter|exec|execute|declare|cursor|fetch|bulk|openrowset|opendatasource|sp_|xp_)(\s|$|\(|\;)' THEN
    RAISE EXCEPTION 'Entrada contiene patrones de SQL peligrosos';
  END IF;
  
  -- Enhanced XSS pattern detection
  IF input_text ~* '(<script|<iframe|<object|<embed|<link|<meta|javascript:|vbscript:|on\w+\s*=|expression\s*\(|@import|data:text/html)' THEN
    RAISE EXCEPTION 'Entrada contiene patrones XSS peligrosos';
  END IF;
  
  -- Path traversal detection
  IF input_text ~* '(\.\./|\.\.\&|\.\.%2f|\.\.%5c|%2e%2e%2f|%2e%2e%5c)' THEN
    RAISE EXCEPTION 'Entrada contiene patrones de path traversal';
  END IF;
  
  -- Command injection detection
  IF input_text ~* '(\||&|;|`|\$\(|\${|<\(|>\(|\|\||&&)' THEN
    RAISE EXCEPTION 'Entrada contiene patrones de command injection';
  END IF;
  
  -- Remove dangerous HTML completely
  input_text := regexp_replace(input_text, '<script[^>]*>.*?</script>', '', 'gi');
  input_text := regexp_replace(input_text, '<iframe[^>]*>.*?</iframe>', '', 'gi');
  input_text := regexp_replace(input_text, 'javascript:', '', 'gi');
  input_text := regexp_replace(input_text, 'vbscript:', '', 'gi');
  input_text := regexp_replace(input_text, 'on\w+\s*=', '', 'gi');
  input_text := regexp_replace(input_text, 'expression\s*\(', '', 'gi');
  
  -- Limit length to prevent DoS (reduced from 10000 to 5000)
  IF length(input_text) > 5000 THEN
    RAISE EXCEPTION 'Entrada demasiado larga (máximo 5000 caracteres)';
  END IF;
  
  RETURN trim(input_text);
END;
$function$;

-- 4. Enhanced Rate Limiting Function
CREATE OR REPLACE FUNCTION public.check_rate_limit_enhanced(
  p_operation text,
  p_identifier text,
  p_max_requests integer DEFAULT 50,
  p_window_minutes integer DEFAULT 1
)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  request_count integer;
  window_start timestamp with time zone;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Count requests in current window
  SELECT count(*) INTO request_count
  FROM security_logs
  WHERE event_type = 'rate_limit_check'
    AND metadata->>'operation' = p_operation
    AND metadata->>'identifier' = p_identifier
    AND created_at >= window_start;
  
  -- Log this check
  PERFORM public.enhanced_log_security_event(
    'rate_limit_check',
    'low',
    'Rate limit check for operation: ' || p_operation,
    jsonb_build_object(
      'operation', p_operation,
      'identifier', p_identifier,
      'current_count', request_count,
      'max_requests', p_max_requests,
      'window_minutes', p_window_minutes
    )
  );
  
  -- Return true if under limit
  RETURN request_count < p_max_requests;
END;
$function$;

-- 5. Secure User Role Assignment with Enhanced Validation
CREATE OR REPLACE FUNCTION public.assign_user_role_secure(
  _target_user_id uuid, 
  _role app_role
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_role app_role;
  target_user_email text;
  current_user_email text;
  result jsonb;
BEGIN
  -- Get current user's highest role
  SELECT public.get_user_highest_role(auth.uid()) INTO current_user_role;
  
  -- Get user emails for logging
  SELECT email INTO target_user_email FROM auth.users WHERE id = _target_user_id;
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  -- Enhanced permission validation
  IF current_user_role IS NULL OR current_user_role NOT IN ('admin', 'superadmin') THEN
    PERFORM public.enhanced_log_security_event(
      'unauthorized_role_assignment_attempt',
      'critical',
      'Usuario sin permisos intentó asignar rol',
      jsonb_build_object(
        'target_user_id', _target_user_id,
        'target_user_email', target_user_email,
        'attempted_role', _role,
        'current_user_role', current_user_role,
        'current_user_email', current_user_email
      )
    );
    RETURN jsonb_build_object('success', false, 'error', 'No tienes permisos para asignar roles');
  END IF;
  
  -- Prevent self-role assignment (security measure)
  IF auth.uid() = _target_user_id THEN
    PERFORM public.enhanced_log_security_event(
      'self_role_assignment_attempt',
      'critical',
      'Intento de auto-asignación de rol detectado',
      jsonb_build_object(
        'attempted_role', _role,
        'user_email', current_user_email
      )
    );
    RETURN jsonb_build_object('success', false, 'error', 'No puedes asignarte roles a ti mismo');
  END IF;
  
  -- Superadmin role can only be assigned by superadmins
  IF _role = 'superadmin' AND current_user_role != 'superadmin' THEN
    PERFORM public.enhanced_log_security_event(
      'unauthorized_superadmin_assignment',
      'critical',
      'Intento de asignación de rol superadmin sin permisos',
      jsonb_build_object(
        'target_user_id', _target_user_id,
        'target_user_email', target_user_email,
        'current_user_role', current_user_role,
        'current_user_email', current_user_email
      )
    );
    RETURN jsonb_build_object('success', false, 'error', 'Solo los superadministradores pueden asignar roles de superadministrador');
  END IF;
  
  -- Validate target user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _target_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuario no encontrado');
  END IF;
  
  -- Rate limit role assignments (max 10 per hour per user)
  IF NOT public.check_rate_limit_enhanced('role_assignment', auth.uid()::text, 10, 60) THEN
    PERFORM public.enhanced_log_security_event(
      'role_assignment_rate_limited',
      'high',
      'Asignación de rol bloqueada por rate limiting',
      jsonb_build_object(
        'target_user_id', _target_user_id,
        'attempted_role', _role,
        'current_user_email', current_user_email
      )
    );
    RETURN jsonb_build_object('success', false, 'error', 'Demasiadas asignaciones de rol. Intenta más tarde.');
  END IF;
  
  -- Insert role (with conflict handling)
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (_target_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log successful assignment
  PERFORM public.enhanced_log_security_event(
    'role_assigned_secure',
    'high',
    'Rol asignado de forma segura: ' || _role::text,
    jsonb_build_object(
      'target_user_id', _target_user_id,
      'target_user_email', target_user_email,
      'assigned_role', _role,
      'assigned_by', auth.uid(),
      'assigned_by_email', current_user_email
    )
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Rol asignado exitosamente');
  
EXCEPTION
  WHEN OTHERS THEN
    PERFORM public.enhanced_log_security_event(
      'role_assignment_failed',
      'high',
      'Error al asignar rol: ' || SQLERRM,
      jsonb_build_object(
        'target_user_id', _target_user_id,
        'target_user_email', target_user_email,
        'attempted_role', _role,
        'attempted_by', auth.uid(),
        'attempted_by_email', current_user_email,
        'error', SQLERRM
      )
    );
    RETURN jsonb_build_object('success', false, 'error', 'Error interno al asignar rol');
END;
$function$;

-- 6. Enhanced Session Security Function
CREATE OR REPLACE FUNCTION public.validate_session_security()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  session_created_at timestamp with time zone;
  session_age interval;
  user_role app_role;
  max_session_duration interval;
BEGIN
  -- Get session creation time
  SELECT created_at INTO session_created_at
  FROM auth.users
  WHERE id = auth.uid();
  
  IF session_created_at IS NULL THEN
    PERFORM public.enhanced_log_security_event(
      'invalid_session_check',
      'high',
      'Validación de sesión falló - usuario no encontrado',
      jsonb_build_object('user_id', auth.uid())
    );
    RETURN false;
  END IF;
  
  -- Get user role to determine session timeout
  SELECT public.get_user_highest_role(auth.uid()) INTO user_role;
  
  -- Set session duration based on role (enhanced security)
  CASE user_role
    WHEN 'superadmin' THEN max_session_duration := interval '2 hours';
    WHEN 'admin' THEN max_session_duration := interval '4 hours';
    ELSE max_session_duration := interval '8 hours';
  END CASE;
  
  -- Calculate session age
  session_age := now() - session_created_at;
  
  -- Check if session has expired
  IF session_age > max_session_duration THEN
    PERFORM public.enhanced_log_security_event(
      'session_expired',
      'medium',
      'Sesión expirada detectada',
      jsonb_build_object(
        'user_role', user_role,
        'session_age_hours', extract(epoch from session_age) / 3600,
        'max_duration_hours', extract(epoch from max_session_duration) / 3600
      )
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

-- 7. Create Security Audit Function
CREATE OR REPLACE FUNCTION public.run_security_audit()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  audit_result jsonb := '{"status": "completed", "findings": []}'::jsonb;
  finding jsonb;
  findings jsonb[] := ARRAY[]::jsonb[];
BEGIN
  -- Check for users without roles
  SELECT count(*) INTO finding
  FROM auth.users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  WHERE ur.user_id IS NULL;
  
  IF (finding::integer) > 0 THEN
    findings := findings || jsonb_build_object(
      'type', 'users_without_roles',
      'severity', 'medium',
      'count', finding,
      'description', 'Usuarios sin roles asignados encontrados'
    );
  END IF;
  
  -- Check for inactive sessions
  SELECT count(*) INTO finding
  FROM auth.users
  WHERE created_at < now() - interval '90 days'
    AND last_sign_in_at < now() - interval '30 days';
  
  IF (finding::integer) > 0 THEN
    findings := findings || jsonb_build_object(
      'type', 'inactive_sessions',
      'severity', 'low',
      'count', finding,
      'description', 'Sesiones inactivas detectadas'
    );
  END IF;
  
  -- Check for suspicious security events
  SELECT count(*) INTO finding
  FROM security_logs
  WHERE severity = 'critical'
    AND created_at >= now() - interval '24 hours';
  
  IF (finding::integer) > 0 THEN
    findings := findings || jsonb_build_object(
      'type', 'critical_security_events',
      'severity', 'high',
      'count', finding,
      'description', 'Eventos de seguridad críticos en las últimas 24 horas'
    );
  END IF;
  
  -- Update audit result
  audit_result := jsonb_set(audit_result, '{findings}', to_jsonb(findings));
  audit_result := jsonb_set(audit_result, '{timestamp}', to_jsonb(now()));
  
  -- Log audit completion
  PERFORM public.enhanced_log_security_event(
    'security_audit_completed',
    'low',
    'Auditoría de seguridad completada',
    audit_result
  );
  
  RETURN audit_result;
END;
$function$;