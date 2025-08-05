-- CRITICAL SECURITY FIXES - PHASE 1: Database Security (Fixed)

-- 1. Create secure helper functions first
CREATE OR REPLACE FUNCTION public.enhanced_log_security_event(
  p_event_type TEXT,
  p_severity TEXT DEFAULT 'medium',
  p_description TEXT DEFAULT '',
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id UUID;
  user_email TEXT;
  user_role APP_ROLE;
BEGIN
  -- Get user email and role safely
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  SELECT public.get_user_highest_role(auth.uid()) INTO user_role;
  
  -- Enhanced metadata with user context
  p_metadata := p_metadata || jsonb_build_object(
    'user_role', user_role,
    'timestamp', now(),
    'session_id', current_setting('request.jwt.claims', true)::jsonb->>'session_id'
  );
  
  INSERT INTO public.security_logs (
    event_type, severity, description, metadata,
    user_id, user_email, ip_address
  ) VALUES (
    p_event_type, p_severity, p_description, p_metadata,
    auth.uid(), user_email, inet_client_addr()
  ) RETURNING id INTO log_id;
  
  -- Alert on critical events
  IF p_severity IN ('critical', 'high') THEN
    RAISE WARNING 'SECURITY ALERT [%]: % - %', p_severity, p_event_type, p_description;
  END IF;
  
  RETURN log_id;
END;
$$;

-- 2. Enhanced input sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_input(p_input TEXT, p_max_length INTEGER DEFAULT 1000)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_input IS NULL OR p_input = '' THEN
    RETURN '';
  END IF;
  
  IF length(p_input) > p_max_length THEN
    RAISE EXCEPTION 'Input too long. Maximum % characters allowed.', p_max_length;
  END IF;
  
  -- Remove dangerous patterns
  p_input := regexp_replace(p_input, '<script[^>]*>.*?</script>', '', 'gi');
  p_input := regexp_replace(p_input, 'javascript:', '', 'gi');
  p_input := regexp_replace(p_input, 'vbscript:', '', 'gi');
  p_input := regexp_replace(p_input, 'on\w+\s*=', '', 'gi');
  
  -- SQL injection patterns
  IF p_input ~* '(union|select|insert|update|delete|drop|create|alter|exec|execute)(\s|$)' THEN
    RAISE EXCEPTION 'Input contains dangerous SQL patterns';
  END IF;
  
  RETURN trim(p_input);
END;
$$;

-- 3. Fix nullable created_by/user_id fields - CRITICAL SECURITY ISSUE
DO $$
DECLARE
  default_admin_id UUID;
  fixed_count INTEGER := 0;
BEGIN
  -- Find the first superadmin user to use as default for NULL records
  SELECT ur.user_id INTO default_admin_id
  FROM public.user_roles ur
  WHERE ur.role = 'superadmin'
  ORDER BY ur.created_at
  LIMIT 1;
  
  -- If no superadmin, find any admin
  IF default_admin_id IS NULL THEN
    SELECT ur.user_id INTO default_admin_id
    FROM public.user_roles ur
    WHERE ur.role = 'admin'
    ORDER BY ur.created_at
    LIMIT 1;
  END IF;
  
  -- If no admin users exist, create a system placeholder
  IF default_admin_id IS NULL THEN
    default_admin_id := '00000000-0000-0000-0000-000000000000';
    RAISE WARNING 'No admin users found - using system placeholder ID';
  END IF;
  
  -- Update NULL created_by fields across critical tables only (others may not exist)
  UPDATE public.companies SET created_by = default_admin_id WHERE created_by IS NULL;
  GET DIAGNOSTICS fixed_count = ROW_COUNT;
  
  UPDATE public.contacts SET created_by = default_admin_id WHERE created_by IS NULL;
  UPDATE public.operations SET created_by = default_admin_id WHERE created_by IS NULL;
  UPDATE public.cases SET created_by = default_admin_id WHERE created_by IS NULL;
  UPDATE public.collaborators SET created_by = default_admin_id WHERE created_by IS NULL;
  UPDATE public.buying_mandates SET created_by = default_admin_id WHERE created_by IS NULL;
  UPDATE public.communication_templates SET created_by = default_admin_id WHERE created_by IS NULL;
  
  -- Log the security fix
  PERFORM public.enhanced_log_security_event(
    'security_fix_nullable_fields',
    'high',
    'Fixed nullable created_by/user_id fields across critical tables',
    jsonb_build_object(
      'default_admin_id', default_admin_id,
      'companies_fixed', fixed_count
    )
  );
END;
$$;

-- 4. Make critical fields NOT NULL (only for existing tables)
ALTER TABLE public.companies ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.contacts ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.operations ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.cases ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.collaborators ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.buying_mandates ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.communication_templates ALTER COLUMN created_by SET NOT NULL;

-- 5. Create audit trigger for security-sensitive changes
CREATE OR REPLACE FUNCTION public.audit_security_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log changes to user_roles table
  IF TG_TABLE_NAME = 'user_roles' THEN
    IF TG_OP = 'INSERT' THEN
      PERFORM public.enhanced_log_security_event(
        'user_role_assigned',
        'high',
        'New role assigned: ' || NEW.role::TEXT,
        jsonb_build_object(
          'target_user_id', NEW.user_id,
          'assigned_role', NEW.role,
          'assigned_by', auth.uid()
        )
      );
    ELSIF TG_OP = 'DELETE' THEN
      PERFORM public.enhanced_log_security_event(
        'user_role_removed',
        'high',
        'Role removed: ' || OLD.role::TEXT,
        jsonb_build_object(
          'target_user_id', OLD.user_id,
          'removed_role', OLD.role,
          'removed_by', auth.uid()
        )
      );
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Apply audit trigger to user_roles table
DROP TRIGGER IF EXISTS audit_user_roles_trigger ON public.user_roles;
CREATE TRIGGER audit_user_roles_trigger
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_security_changes();

-- 6. Enhanced logging for sensitive operations (INSERT/UPDATE/DELETE only)
CREATE OR REPLACE FUNCTION public.log_sensitive_operations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log modifications to sensitive financial data
  IF TG_TABLE_NAME IN ('commissions', 'commission_payments', 'commission_approvals') THEN
    PERFORM public.enhanced_log_security_event(
      'sensitive_data_modification',
      'high',
      'Modification to sensitive table: ' || TG_TABLE_NAME || ' (' || TG_OP || ')',
      jsonb_build_object(
        'table_name', TG_TABLE_NAME,
        'operation', TG_OP,
        'record_id', COALESCE(NEW.id, OLD.id),
        'user_id', auth.uid()
      )
    );
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Apply logging triggers to sensitive tables
DROP TRIGGER IF EXISTS log_commission_operations ON public.commissions;
CREATE TRIGGER log_commission_operations
  AFTER INSERT OR UPDATE OR DELETE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operations();

-- 7. Log this major security enhancement completion
SELECT public.enhanced_log_security_event(
  'major_security_enhancement_phase1',
  'high',
  'Critical database security fixes applied successfully',
  jsonb_build_object(
    'fixes_applied', array[
      'Fixed nullable user fields in critical tables',
      'Made user fields NOT NULL to prevent RLS bypass',
      'Created enhanced security logging functions',
      'Added audit triggers for sensitive operations',
      'Enhanced input sanitization capabilities'
    ],
    'phase', 'critical_database_security',
    'next_phase', 'input_validation_and_forms',
    'completion_time', now()
  )
);