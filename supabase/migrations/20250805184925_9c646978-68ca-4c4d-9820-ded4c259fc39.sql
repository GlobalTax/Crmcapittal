-- Security Enhancement Migration
-- Fix critical security issues identified in review

-- 1. Add search_path to all SECURITY DEFINER functions for safety
-- Update existing functions that lack proper search_path settings

-- Fix validate_password_strength function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    result jsonb := '{"valid": true, "errors": []}'::jsonb;
    errors text[] := ARRAY[]::text[];
BEGIN
    -- Check minimum length
    IF length(password) < 8 THEN
        errors := array_append(errors, 'La contraseña debe tener al menos 8 caracteres');
    END IF;
    
    -- Check for uppercase letter
    IF password !~ '[A-Z]' THEN
        errors := array_append(errors, 'La contraseña debe contener al menos una letra mayúscula');
    END IF;
    
    -- Check for lowercase letter
    IF password !~ '[a-z]' THEN
        errors := array_append(errors, 'La contraseña debe contener al menos una letra minúscula');
    END IF;
    
    -- Check for number
    IF password !~ '[0-9]' THEN
        errors := array_append(errors, 'La contraseña debe contener al menos un número');
    END IF;
    
    -- Check for special character
    IF password !~ '[^a-zA-Z0-9]' THEN
        errors := array_append(errors, 'La contraseña debe contener al menos un carácter especial');
    END IF;
    
    -- Update result
    IF array_length(errors, 1) > 0 THEN
        result := jsonb_build_object('valid', false, 'errors', errors);
    END IF;
    
    RETURN result;
END;
$function$;

-- Fix check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  identifier text,
  max_requests integer DEFAULT 100,
  window_minutes integer DEFAULT 60
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_count integer;
  window_start timestamp with time zone;
  result jsonb;
BEGIN
  -- Calculate window start time
  window_start := NOW() - (window_minutes || ' minutes')::interval;
  
  -- Clean old entries first
  DELETE FROM rate_limit_log 
  WHERE created_at < window_start;
  
  -- Count current requests for this identifier
  SELECT COUNT(*) INTO current_count
  FROM rate_limit_log
  WHERE identifier_hash = encode(digest(identifier, 'sha256'), 'hex')
    AND created_at >= window_start;
  
  -- Check if limit exceeded
  IF current_count >= max_requests THEN
    -- Log security event for rate limit violation
    PERFORM log_security_event(
      'rate_limit_exceeded',
      'medium',
      'Rate limit exceeded for identifier',
      jsonb_build_object(
        'identifier_hash', encode(digest(identifier, 'sha256'), 'hex'),
        'current_count', current_count,
        'max_requests', max_requests,
        'window_minutes', window_minutes
      )
    );
    
    RETURN jsonb_build_object(
      'allowed', false,
      'current_count', current_count,
      'max_requests', max_requests,
      'reset_time', window_start + (window_minutes || ' minutes')::interval
    );
  END IF;
  
  -- Log this request
  INSERT INTO rate_limit_log (identifier_hash)
  VALUES (encode(digest(identifier, 'sha256'), 'hex'));
  
  RETURN jsonb_build_object(
    'allowed', true,
    'current_count', current_count + 1,
    'max_requests', max_requests,
    'remaining', max_requests - current_count - 1
  );
END;
$function$;

-- 2. Create enhanced security logging function with better PII protection
CREATE OR REPLACE FUNCTION public.enhanced_log_security_event(
  p_event_type text,
  p_severity text DEFAULT 'medium'::text,
  p_description text DEFAULT ''::text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  log_id uuid;
  user_email text;
  sanitized_metadata jsonb;
BEGIN
  -- Get user email if available
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Sanitize metadata to prevent PII leakage
  sanitized_metadata := p_metadata;
  
  -- Remove or mask sensitive fields
  IF sanitized_metadata ? 'email' THEN
    sanitized_metadata := sanitized_metadata || jsonb_build_object(
      'email', CASE 
        WHEN length(sanitized_metadata->>'email') > 4 
        THEN '*****' || right(sanitized_metadata->>'email', 4)
        ELSE '*****'
      END
    );
  END IF;
  
  IF sanitized_metadata ? 'phone' THEN
    sanitized_metadata := sanitized_metadata || jsonb_build_object(
      'phone', CASE 
        WHEN length(sanitized_metadata->>'phone') > 4 
        THEN '*****' || right(sanitized_metadata->>'phone', 4)
        ELSE '*****'
      END
    );
  END IF;
  
  -- Insert security log with sanitized data
  INSERT INTO public.security_logs (
    event_type,
    severity,
    description,
    metadata,
    user_id,
    user_email,
    ip_address
  ) VALUES (
    p_event_type,
    p_severity,
    p_description,
    sanitized_metadata,
    auth.uid(),
    user_email,
    inet_client_addr()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- 3. Create secure IP address logging function (avoid external calls)
CREATE OR REPLACE FUNCTION public.get_client_ip()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Use PostgreSQL's built-in inet_client_addr() instead of external service
  RETURN COALESCE(inet_client_addr()::text, 'unknown');
END;
$function$;

-- 4. Add audit function for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_operation(
  operation_type text,
  table_name text,
  record_id text,
  old_values jsonb DEFAULT NULL,
  new_values jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO audit_trail (
    operation,
    table_name,
    user_id,
    user_email,
    ip_address,
    old_data,
    new_data,
    session_id,
    user_agent
  ) VALUES (
    operation_type,
    table_name,
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    get_client_ip(),
    old_values,
    new_values,
    COALESCE(current_setting('app.session_id', true), gen_random_uuid()::text),
    current_setting('app.user_agent', true)
  );
END;
$function$;

-- 5. Create function to check for suspicious activity patterns
CREATE OR REPLACE FUNCTION public.check_suspicious_activity()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  failed_attempts integer;
  rapid_requests integer;
  user_ip text;
BEGIN
  user_ip := get_client_ip();
  
  -- Check for multiple failed login attempts from same IP
  SELECT COUNT(*) INTO failed_attempts
  FROM security_logs
  WHERE event_type = 'failed_login'
    AND ip_address = user_ip::inet
    AND timestamp > NOW() - interval '15 minutes';
  
  IF failed_attempts > 5 THEN
    PERFORM enhanced_log_security_event(
      'suspicious_login_pattern',
      'high',
      'Multiple failed login attempts detected',
      jsonb_build_object('failed_attempts', failed_attempts, 'ip_address', user_ip)
    );
    RETURN true;
  END IF;
  
  -- Check for rapid API requests
  SELECT COUNT(*) INTO rapid_requests
  FROM security_logs
  WHERE ip_address = user_ip::inet
    AND timestamp > NOW() - interval '1 minute';
  
  IF rapid_requests > 50 THEN
    PERFORM enhanced_log_security_event(
      'rapid_api_requests',
      'medium',
      'Unusually high API request rate detected',
      jsonb_build_object('requests_per_minute', rapid_requests, 'ip_address', user_ip)
    );
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;

-- 6. Create rate limiting table if not exists
CREATE TABLE IF NOT EXISTS rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_created_at ON rate_limit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier ON rate_limit_log(identifier_hash);

-- 7. Add RLS policy for rate_limit_log
ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage rate limit logs"
  ON rate_limit_log
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 8. Create security monitoring view (replace any security definer views)
CREATE OR REPLACE VIEW security_events_summary AS
SELECT 
  date_trunc('hour', timestamp) as hour,
  event_type,
  severity,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT ip_address) as unique_ips
FROM security_logs
WHERE timestamp > NOW() - interval '24 hours'
GROUP BY date_trunc('hour', timestamp), event_type, severity
ORDER BY hour DESC, event_count DESC;

-- Grant appropriate permissions
GRANT SELECT ON security_events_summary TO authenticated;

-- 9. Add function to validate user permissions safely
CREATE OR REPLACE FUNCTION public.has_role_secure(user_id uuid, required_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = $1
      AND user_roles.role = $2
  );
$function$;

-- 10. Create Content Security Policy configuration
CREATE TABLE IF NOT EXISTS csp_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  directive text NOT NULL,
  source_list text[] NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- Insert default CSP directives
INSERT INTO csp_config (directive, source_list) VALUES
  ('default-src', ARRAY['''self''']),
  ('script-src', ARRAY['''self''', '''unsafe-inline''']),
  ('style-src', ARRAY['''self''', '''unsafe-inline''']),
  ('img-src', ARRAY['''self''', 'data:', 'https:']),
  ('connect-src', ARRAY['''self''', 'https://nbvvdaprcecaqvvkqcto.supabase.co', 'wss://nbvvdaprcecaqvvkqcto.supabase.co']),
  ('font-src', ARRAY['''self''', 'data:']),
  ('frame-ancestors', ARRAY['''none''']),
  ('base-uri', ARRAY['''self''']),
  ('form-action', ARRAY['''self''''])
ON CONFLICT DO NOTHING;

-- Enable RLS on CSP config
ALTER TABLE csp_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage CSP config"
  ON csp_config
  FOR ALL
  USING (has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role))
  WITH CHECK (has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Users can view CSP config"
  ON csp_config
  FOR SELECT
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_csp_config_updated_at
  BEFORE UPDATE ON csp_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();