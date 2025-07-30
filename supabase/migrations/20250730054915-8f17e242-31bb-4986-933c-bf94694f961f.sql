-- SECURITY FIX: Phase 2B - Fix function parameter issue and complete security hardening

-- Drop and recreate the password validation function with correct parameter name
DROP FUNCTION IF EXISTS public.validate_password_strength(text);

CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
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
    
    -- Check for digit
    IF password !~ '[0-9]' THEN
        errors := array_append(errors, 'La contraseña debe contener al menos un número');
    END IF;
    
    -- Check for special character
    IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
        errors := array_append(errors, 'La contraseña debe contener al menos un carácter especial');
    END IF;
    
    -- Check for common patterns
    IF password ~* '(password|123456|qwerty|admin|letmein)' THEN
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

-- Create audit trail for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_trail (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name text NOT NULL,
    operation text NOT NULL,
    old_data jsonb,
    new_data jsonb,
    user_id uuid,
    user_email text,
    timestamp timestamp with time zone DEFAULT now(),
    ip_address inet,
    user_agent text,
    session_id text
);

-- Enable RLS on audit trail
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit trail"
ON public.audit_trail
FOR SELECT
USING (has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "System can insert audit records"
ON public.audit_trail
FOR INSERT
WITH CHECK (true);

-- Prevent modification of audit records
CREATE POLICY "Audit records are immutable"
ON public.audit_trail
FOR UPDATE
USING (false);

CREATE POLICY "Audit records cannot be deleted"
ON public.audit_trail
FOR DELETE
USING (false);