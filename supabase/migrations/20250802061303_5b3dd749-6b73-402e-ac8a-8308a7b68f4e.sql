-- Critical Security Fixes Migration
-- Phase 1: Database Security Hardening

-- 1. Fix functions with mutable search_path by adding SET search_path = ''
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

-- 2. Create secure helper functions for RLS policies
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

-- 3. Tighten overly permissive RLS policies
-- Fix contact_companies policies (currently allows all users to do everything)
DROP POLICY IF EXISTS "Users can create contact companies" ON public.contact_companies;
DROP POLICY IF EXISTS "Users can update contact companies" ON public.contact_companies;
DROP POLICY IF EXISTS "Users can delete contact companies" ON public.contact_companies;
DROP POLICY IF EXISTS "Users can view all contact companies" ON public.contact_companies;

CREATE POLICY "Users can create contact companies for their contacts" ON public.contact_companies
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = contact_companies.contact_id 
    AND contacts.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update contact companies for their contacts" ON public.contact_companies
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = contact_companies.contact_id 
    AND contacts.created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete contact companies for their contacts" ON public.contact_companies
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = contact_companies.contact_id 
    AND contacts.created_by = auth.uid()
  )
);

CREATE POLICY "Users can view contact companies for their contacts" ON public.contact_companies
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = contact_companies.contact_id 
    AND contacts.created_by = auth.uid()
  )
);

-- Fix contact_operations policies (currently allows all users to do everything)
DROP POLICY IF EXISTS "Users can manage contact operations" ON public.contact_operations;
DROP POLICY IF EXISTS "Users can view all contact operations" ON public.contact_operations;

CREATE POLICY "Users can manage contact operations for their contacts" ON public.contact_operations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = contact_operations.contact_id 
    AND contacts.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.operations 
    WHERE operations.id = contact_operations.operation_id 
    AND operations.created_by = auth.uid()
  )
);

-- Fix contact_tag_relations policies (currently allows all users to do everything)
DROP POLICY IF EXISTS "Users can manage contact tag relations" ON public.contact_tag_relations;
DROP POLICY IF EXISTS "Users can view all contact tag relations" ON public.contact_tag_relations;

CREATE POLICY "Users can manage contact tag relations for their contacts" ON public.contact_tag_relations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = contact_tag_relations.contact_id 
    AND contacts.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.contact_tags 
    WHERE contact_tags.id = contact_tag_relations.tag_id 
    AND contact_tags.created_by = auth.uid()
  )
);

-- 4. Strengthen user data isolation by making critical columns NOT NULL where used for RLS
-- Add validation to ensure proper user_id setting
CREATE OR REPLACE FUNCTION public.validate_user_ownership()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure created_by is set to current user for new records
  IF TG_OP = 'INSERT' THEN
    IF NEW.created_by IS NULL THEN
      NEW.created_by := auth.uid();
    ELSIF NEW.created_by != auth.uid() THEN
      RAISE EXCEPTION 'Cannot create records for other users';
    END IF;
  END IF;
  
  -- Prevent changing ownership
  IF TG_OP = 'UPDATE' AND OLD.created_by != NEW.created_by THEN
    RAISE EXCEPTION 'Cannot change record ownership';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Apply validation trigger to key tables
CREATE TRIGGER validate_company_ownership
  BEFORE INSERT OR UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION validate_user_ownership();

CREATE TRIGGER validate_contact_ownership
  BEFORE INSERT OR UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION validate_user_ownership();

CREATE TRIGGER validate_lead_ownership
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION validate_user_ownership();

-- 5. Add enhanced security logging for privilege changes
CREATE OR REPLACE FUNCTION public.log_privilege_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any privilege or role changes
  PERFORM public.enhanced_log_security_event(
    'privilege_change_detected',
    'high',
    format('Privilege change in table %s: %s', TG_TABLE_NAME, TG_OP),
    jsonb_build_object(
      'table_name', TG_TABLE_NAME,
      'operation', TG_OP,
      'old_data', to_jsonb(OLD),
      'new_data', to_jsonb(NEW),
      'user_id', auth.uid(),
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Apply to user_roles table for monitoring
CREATE TRIGGER log_user_role_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION log_privilege_change();

-- 6. Add constraint to prevent orphaned user data
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_not_null 
CHECK (user_id IS NOT NULL);

-- 7. Create function to validate password strength
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