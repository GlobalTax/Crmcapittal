-- Critical Security Fixes Migration - Part 1
-- Fix function conflicts first

-- 1. Drop existing functions that need to be recreated with security fixes
DROP FUNCTION IF EXISTS public.get_user_highest_role(uuid);
DROP FUNCTION IF EXISTS public.has_role_secure(uuid, app_role);

-- 2. Recreate functions with proper security settings
CREATE OR REPLACE FUNCTION public.get_user_highest_role(user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_roles.user_id = $1
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role_secure(user_id uuid, required_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = $1
      AND user_roles.role = $2
  );
$$;

-- 3. Fix functions with mutable search_path by adding SET search_path = ''
CREATE OR REPLACE FUNCTION public.sanitize_input(p_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
BEGIN
  IF p_input IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove dangerous characters and patterns
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(p_input, '<[^>]*>', '', 'g'), -- Remove HTML tags
        '[''";\\]', '', 'g'), -- Remove SQL injection chars
      '[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', '', 'g'), -- Remove control chars
    '(script|javascript|vbscript|onload|onerror)', '', 'gi'); -- Remove script references
END;
$$;

CREATE OR REPLACE FUNCTION public.sanitize_reconversion_data(p_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
DECLARE
  sanitized_data jsonb := p_data;
BEGIN
  -- Sanitizar campos de texto (remover HTML, scripts, etc.)
  IF sanitized_data ? 'company_name' THEN
    sanitized_data := jsonb_set(
      sanitized_data,
      '{company_name}',
      to_jsonb(regexp_replace(sanitized_data->>'company_name', '<[^>]*>', '', 'g'))
    );
  END IF;
  
  IF sanitized_data ? 'original_rejection_reason' THEN
    sanitized_data := jsonb_set(
      sanitized_data,
      '{original_rejection_reason}',
      to_jsonb(regexp_replace(sanitized_data->>'original_rejection_reason', '<[^>]*>', '', 'g'))
    );
  END IF;
  
  -- Validar rangos numéricos
  IF sanitized_data ? 'investment_capacity_min' THEN
    IF (sanitized_data->>'investment_capacity_min')::numeric < 0 THEN
      sanitized_data := jsonb_set(sanitized_data, '{investment_capacity_min}', '0');
    END IF;
  END IF;
  
  IF sanitized_data ? 'investment_capacity_max' THEN
    IF (sanitized_data->>'investment_capacity_max')::numeric < 0 THEN
      sanitized_data := jsonb_set(sanitized_data, '{investment_capacity_max}', '0');
    END IF;
  END IF;
  
  RETURN sanitized_data;
END;
$$;

-- 4. Create function to validate password strength
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb := '{"valid": true, "errors": []}'::jsonb;
  errors text[] := '{}';
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    errors := array_append(errors, 'Password must be at least 8 characters long');
  END IF;
  
  -- Check for uppercase
  IF password !~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Check for lowercase
  IF password !~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Check for numbers
  IF password !~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  END IF;
  
  -- Check for special characters
  IF password !~ '[^A-Za-z0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  END IF;
  
  -- Check for common patterns
  IF password ILIKE '%password%' OR password ILIKE '%123456%' OR password ILIKE '%qwerty%' THEN
    errors := array_append(errors, 'Password contains common patterns that are not secure');
  END IF;
  
  IF array_length(errors, 1) > 0 THEN
    result := jsonb_build_object(
      'valid', false,
      'errors', to_jsonb(errors)
    );
  END IF;
  
  RETURN result;
END;
$$;