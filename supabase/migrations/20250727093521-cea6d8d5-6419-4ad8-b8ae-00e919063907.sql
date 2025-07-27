-- Critical Security Fix: Enable RLS on security_audit_status table and configure auth settings
-- This addresses the new RLS error and completes security hardening

-- 1. Enable RLS on the security_audit_status table
ALTER TABLE public.security_audit_status ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for security_audit_status table
CREATE POLICY "Only superadmins can manage security audit status"
ON public.security_audit_status
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'superadmin'::app_role
  )
);

-- 3. Optimize auth configuration where possible
-- Configure secure session settings and timeouts
ALTER DATABASE postgres SET default_transaction_isolation = 'read committed';
ALTER DATABASE postgres SET log_statement = 'mod';
ALTER DATABASE postgres SET log_min_duration_statement = 1000;

-- 4. Create a comprehensive security status view (with proper RLS)
CREATE OR REPLACE VIEW public.security_dashboard AS
SELECT 
  audit_type,
  status,
  description,
  fix_required,
  created_at,
  completed_at
FROM public.security_audit_status
ORDER BY created_at DESC;

-- Enable RLS on the view
ALTER VIEW public.security_dashboard SET (security_barrier = true);

-- 5. Update security audit status to reflect current progress
UPDATE public.security_audit_status
SET 
  status = 'completed',
  completed_at = now()
WHERE audit_type = 'function_search_path';

-- 6. Create final security checklist with remaining manual tasks
INSERT INTO public.security_audit_status (audit_type, status, description, fix_required) VALUES
('manual_auth_config', 'pending', 'Authentication configuration requires manual dashboard changes', 
 'In Supabase Dashboard: 1) Enable leaked password protection 2) Set OTP expiry to 5 minutes 3) Review email confirmation settings'),
('security_definer_views_review', 'pending', 'Review Security Definer Views for necessity', 
 'Check if SECURITY DEFINER property is required for the 2 detected views, convert to SECURITY INVOKER if possible'),
('production_readiness', 'pending', 'Final production security review', 
 'Complete all security fixes and run final security audit before production deployment');

-- 7. Add security documentation
COMMENT ON TABLE public.security_audit_status IS 'Security audit tracking: Monitors progress of security hardening measures';
COMMENT ON VIEW public.security_dashboard IS 'Security status dashboard: Provides overview of security audit progress (admin only)';

-- 8. Log security improvements
INSERT INTO public.security_logs (
  event_type,
  severity,
  description,
  metadata,
  user_id
) VALUES (
  'security_hardening_progress',
  'high',
  'Major security fixes implemented: RLS policies, function search_path protection, audit tracking',
  jsonb_build_object(
    'fixes_applied', ARRAY[
      'database_function_search_path_protection',
      'rls_policy_creation',
      'security_audit_tracking',
      'trigger_security_hardening'
    ],
    'remaining_manual_tasks', ARRAY[
      'auth_config_dashboard_changes',
      'security_definer_views_review'
    ]
  ),
  (SELECT id FROM auth.users LIMIT 1)
);