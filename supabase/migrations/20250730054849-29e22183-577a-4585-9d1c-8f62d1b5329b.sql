-- SECURITY FIX: Phase 2 - Fix remaining function search path issues

-- Fix search_path for functions that are missing it
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
begin
  insert into public.user_profiles (id, first_name, last_name)
  values (new.id, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name');
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_reconversion_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix additional security functions
CREATE OR REPLACE FUNCTION public.sanitize_input(p_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
AS $function$
BEGIN
  IF p_input IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Enhanced sanitization with better security
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(p_input, '<script[^>]*>.*?</script>', '', 'gi'), -- Remove script tags and content
          '<[^>]*>', '', 'g'), -- Remove HTML tags
        '[''";\\\\]', '', 'g'), -- Remove SQL injection chars
      '[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', '', 'g'), -- Remove control chars
    '(script|javascript|vbscript|onload|onerror|onclick|onmouseover)', '', 'gi'); -- Remove dangerous event handlers
END;
$function$;

-- Create enhanced rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit_enhanced(
    p_identifier text, 
    p_max_requests integer DEFAULT 100, 
    p_window_minutes integer DEFAULT 60,
    p_operation_type text DEFAULT 'general'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    current_window timestamp with time zone;
    current_count integer;
    is_blocked boolean := false;
BEGIN
    -- Calculate current window start (truncated to the minute)
    current_window := date_trunc('minute', now() - (now()::time)::interval % (p_window_minutes || ' minutes')::interval);
    
    -- Get or create current window count
    INSERT INTO public.rate_limits (identifier, window_start, request_count)
    VALUES (p_identifier || ':' || p_operation_type, current_window, 1)
    ON CONFLICT (identifier, window_start) 
    DO UPDATE SET 
        request_count = rate_limits.request_count + 1,
        created_at = now()
    RETURNING request_count INTO current_count;
    
    -- Check if limit exceeded
    is_blocked := current_count > p_max_requests;
    
    -- Log rate limit violations
    IF is_blocked THEN
        PERFORM public.enhanced_log_security_event(
            'rate_limit_exceeded',
            'high',
            'Rate limit exceeded for operation: ' || p_operation_type,
            jsonb_build_object(
                'identifier', p_identifier,
                'operation_type', p_operation_type,
                'current_count', current_count,
                'max_requests', p_max_requests,
                'window_minutes', p_window_minutes
            )
        );
    END IF;
    
    -- Clean up old windows (older than 24 hours)
    DELETE FROM public.rate_limits 
    WHERE window_start < now() - interval '24 hours';
    
    -- Return true if under limit
    RETURN NOT is_blocked;
END;
$function$;

-- Create secure password validation function
CREATE OR REPLACE FUNCTION public.validate_password_strength(p_password text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
AS $function$
DECLARE
    result jsonb := '{"valid": true, "errors": []}'::jsonb;
    errors text[] := ARRAY[]::text[];
BEGIN
    -- Check minimum length
    IF length(p_password) < 8 THEN
        errors := array_append(errors, 'La contraseña debe tener al menos 8 caracteres');
    END IF;
    
    -- Check for uppercase letter
    IF p_password !~ '[A-Z]' THEN
        errors := array_append(errors, 'La contraseña debe contener al menos una letra mayúscula');
    END IF;
    
    -- Check for lowercase letter
    IF p_password !~ '[a-z]' THEN
        errors := array_append(errors, 'La contraseña debe contener al menos una letra minúscula');
    END IF;
    
    -- Check for digit
    IF p_password !~ '[0-9]' THEN
        errors := array_append(errors, 'La contraseña debe contener al menos un número');
    END IF;
    
    -- Check for special character
    IF p_password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
        errors := array_append(errors, 'La contraseña debe contener al menos un carácter especial');
    END IF;
    
    -- Check for common patterns
    IF p_password ~* '(password|123456|qwerty|admin|letmein)' THEN
        errors := array_append(errors, 'La contraseña contiene patrones comunes no seguros');
    END IF;
    
    -- Build result
    IF array_length(errors, 1) > 0 THEN
        result := jsonb_build_object(
            'valid', false,
            'errors', to_jsonb(errors)
        );
    END IF;
    
    RETURN result;
END;
$function$;