-- CRITICAL SECURITY FIXES - Phase 1

-- Fix 1: Remove SECURITY DEFINER from problematic views and add proper RLS checks
-- First, let's identify and fix the Security Definer views

-- Fix function search paths (Warnings 6 & 7)
-- Update all functions to have explicit search_path settings

-- Fix validate_password_strength function
DROP FUNCTION IF EXISTS public.validate_password_strength(text);
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Fix validate_input_security function
DROP FUNCTION IF EXISTS public.validate_input_security(text);
CREATE OR REPLACE FUNCTION public.validate_input_security(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Remove potential SQL injection patterns
  IF input_text ~* '(union|select|insert|update|delete|drop|create|alter|exec|execute)(\s|$)' THEN
    RAISE EXCEPTION 'Entrada contiene patrones de SQL peligrosos';
  END IF;
  
  -- Remove script tags and other dangerous HTML
  input_text := regexp_replace(input_text, '<script[^>]*>.*?</script>', '', 'gi');
  input_text := regexp_replace(input_text, 'javascript:', '', 'gi');
  input_text := regexp_replace(input_text, 'vbscript:', '', 'gi');
  input_text := regexp_replace(input_text, 'on\w+\s*=', '', 'gi');
  
  -- Limit length to prevent DoS
  IF length(input_text) > 10000 THEN
    RAISE EXCEPTION 'Entrada demasiado larga';
  END IF;
  
  RETURN trim(input_text);
END;
$$;