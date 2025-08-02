-- Fix critical security issues identified in security review

-- 1. Add proper search_path to all existing functions to prevent schema poisoning
ALTER FUNCTION public.update_reconversion_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.log_lead_score_change(uuid, text, numeric, numeric) SET search_path TO 'public';
ALTER FUNCTION public.test_auth_uid() SET search_path TO 'public';
ALTER FUNCTION public.log_reconversion_audit(uuid, text, text, jsonb, jsonb, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.update_lead_last_contacted() SET search_path TO 'public';
ALTER FUNCTION public.update_user_role_secure(uuid, app_role) SET search_path TO 'public';
ALTER FUNCTION public.update_company_file_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.log_role_manipulation_attempt() SET search_path TO 'public';
ALTER FUNCTION public.update_lead_score(uuid, integer) SET search_path TO 'public';
ALTER FUNCTION public.delete_user_completely(uuid) SET search_path TO 'public';
ALTER FUNCTION public.remove_user_role(uuid, app_role) SET search_path TO 'public';
ALTER FUNCTION public.update_contact_file_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.detect_privilege_escalation() SET search_path TO 'public';
ALTER FUNCTION public.generate_transaction_code() SET search_path TO 'public';
ALTER FUNCTION public.create_commission_from_deal() SET search_path TO 'public';
ALTER FUNCTION public.calculate_lead_engagement_score(uuid) SET search_path TO 'public';
ALTER FUNCTION public.send_reconversion_notification(uuid, text, uuid, text, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.sanitize_reconversion_data(jsonb) SET search_path TO 'public';
ALTER FUNCTION public.calculate_prob_conversion_from_nurturing(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_integraloop_config() SET search_path TO 'public';
ALTER FUNCTION public.update_transaction_tasks_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.match_targets_for_reconversion(uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';
ALTER FUNCTION public.handle_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.assign_user_role_secure(uuid, app_role) SET search_path TO 'public';
ALTER FUNCTION public.enhanced_log_security_event(text, text, text, jsonb, text) SET search_path TO 'public';
ALTER FUNCTION public.check_rate_limit(text, integer, integer) SET search_path TO 'public';
ALTER FUNCTION public.get_all_overdue_tasks() SET search_path TO 'public';
ALTER FUNCTION public.sanitize_input(text) SET search_path TO 'public';
ALTER FUNCTION public.log_contact_interaction_activity() SET search_path TO 'public';
ALTER FUNCTION public.log_contact_note_activity() SET search_path TO 'public';
ALTER FUNCTION public.update_contact_task_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.auto_assign_lead(uuid) SET search_path TO 'public';
ALTER FUNCTION public.assign_user_role(uuid, app_role) SET search_path TO 'public';
ALTER FUNCTION public.handle_new_user() SET search_path TO 'public';
ALTER FUNCTION public.handle_lifecycle_stage_change() SET search_path TO 'public';
ALTER FUNCTION public.log_security_event(text, text, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.trigger_reconversion_audit() SET search_path TO 'public';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path TO 'public';
ALTER FUNCTION public.fn_recalcular_score_lead(uuid) SET search_path TO 'public';
ALTER FUNCTION public.trigger_reconversion_notifications() SET search_path TO 'public';
ALTER FUNCTION public.get_current_user_role_safe() SET search_path TO 'public';

-- 2. Replace existing has_role_secure function
DROP FUNCTION IF EXISTS public.has_role_secure(uuid, app_role);
CREATE FUNCTION public.has_role_secure(user_id uuid, role_name app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = has_role_secure.user_id
      AND user_roles.role = has_role_secure.role_name
  )
$$;

-- 3. Create function to get user's highest role securely
CREATE OR REPLACE FUNCTION public.get_user_highest_role(user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_roles.user_id = get_user_highest_role.user_id
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;

-- 4. Add RLS policy for winback_sequences
ALTER TABLE public.winback_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage winback sequences" ON public.winback_sequences
FOR ALL USING (
  public.has_role_secure(auth.uid(), 'admin') OR 
  public.has_role_secure(auth.uid(), 'superadmin')
);

-- 5. Add RLS policy for winback_attempts  
ALTER TABLE public.winback_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view winback attempts for their leads" ON public.winback_attempts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = winback_attempts.lead_id
    AND (
      leads.created_by = auth.uid() OR
      leads.assigned_to_id = auth.uid() OR
      public.has_role_secure(auth.uid(), 'admin') OR
      public.has_role_secure(auth.uid(), 'superadmin')
    )
  )
);

CREATE POLICY "System can create winback attempts" ON public.winback_attempts
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin users can update winback attempts" ON public.winback_attempts
FOR UPDATE USING (
  public.has_role_secure(auth.uid(), 'admin') OR 
  public.has_role_secure(auth.uid(), 'superadmin')
);

-- 6. Add enhanced input validation function with better sanitization
CREATE OR REPLACE FUNCTION public.validate_and_sanitize_input(
  input_text text,
  max_length integer DEFAULT 1000,
  allow_html boolean DEFAULT false
) RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sanitized_text text;
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Trim whitespace
  sanitized_text := trim(input_text);
  
  -- Check length
  IF length(sanitized_text) > max_length THEN
    RAISE EXCEPTION 'Input too long. Maximum % characters allowed.', max_length;
  END IF;
  
  -- Enhanced XSS protection
  sanitized_text := regexp_replace(sanitized_text, '<script[^>]*>.*?</script>', '', 'gi');
  sanitized_text := regexp_replace(sanitized_text, 'javascript:', '', 'gi');
  sanitized_text := regexp_replace(sanitized_text, 'vbscript:', '', 'gi');
  sanitized_text := regexp_replace(sanitized_text, 'on\w+\s*=', '', 'gi');
  
  -- SQL injection protection
  sanitized_text := regexp_replace(sanitized_text, '(union|select|insert|update|delete|drop|create|alter|exec|execute)\s', '', 'gi');
  
  -- Remove HTML if not allowed
  IF NOT allow_html THEN
    sanitized_text := regexp_replace(sanitized_text, '<[^>]*>', '', 'g');
  END IF;
  
  -- Remove control characters
  sanitized_text := regexp_replace(sanitized_text, '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g');
  
  RETURN sanitized_text;
END;
$$;

-- 7. Add function to validate email addresses
CREATE OR REPLACE FUNCTION public.validate_email(email_address text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF email_address IS NULL THEN
    RETURN false;
  END IF;
  
  -- Basic email validation
  RETURN email_address ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- 8. Create security alerts table for critical events
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  security_log_id uuid REFERENCES public.security_logs(id),
  event_type text NOT NULL,
  severity text NOT NULL,
  description text,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  acknowledged boolean DEFAULT false,
  acknowledged_by uuid,
  acknowledged_at timestamp with time zone
);

ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view security alerts" ON public.security_alerts
FOR SELECT USING (
  public.has_role_secure(auth.uid(), 'admin') OR 
  public.has_role_secure(auth.uid(), 'superadmin')
);

CREATE POLICY "Admin users can update security alerts" ON public.security_alerts
FOR UPDATE USING (
  public.has_role_secure(auth.uid(), 'admin') OR 
  public.has_role_secure(auth.uid(), 'superadmin')
);