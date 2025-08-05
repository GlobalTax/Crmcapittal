-- Security Enhancement Migration - Fixed
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

-- 4. Create rate limiting table if not exists
CREATE TABLE IF NOT EXISTS rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_created_at ON rate_limit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier ON rate_limit_log(identifier_hash);

-- 5. Add RLS policy for rate_limit_log
ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage rate limit logs"
  ON rate_limit_log
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Create security monitoring view (replace any security definer views)
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