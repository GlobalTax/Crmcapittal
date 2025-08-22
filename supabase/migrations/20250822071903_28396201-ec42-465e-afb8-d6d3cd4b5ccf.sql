-- =====================================================
-- SECURITY FIX: Add RLS Policies for Exposed Tables (Final Fix)
-- =====================================================

-- 1. CRITICAL: Business Operations and Deals Protection
-- Note: Only applying policies if tables exist

-- Deals table - restrict to authenticated users
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'deals' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "deals_secure_access" ON public.deals;
        CREATE POLICY "deals_secure_access" ON public.deals 
        FOR ALL USING (
          auth.uid() IS NOT NULL AND (
            auth.uid() = created_by OR
            has_role_secure(auth.uid(), 'admin'::app_role) OR 
            has_role_secure(auth.uid(), 'superadmin'::app_role)
          )
        );
    END IF;
END
$$;

-- Operations table - restrict to authenticated users
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'operations' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "operations_secure_access" ON public.operations;
        CREATE POLICY "operations_secure_access" ON public.operations 
        FOR ALL USING (
          auth.uid() IS NOT NULL AND (
            auth.uid() = created_by OR
            has_role_secure(auth.uid(), 'admin'::app_role) OR 
            has_role_secure(auth.uid(), 'superadmin'::app_role)
          )
        );
    END IF;
END
$$;

-- Business Templates Protection (authenticated users only)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'document_templates' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "document_templates_authenticated" ON public.document_templates;
        CREATE POLICY "document_templates_authenticated" ON public.document_templates 
        FOR ALL USING (auth.uid() IS NOT NULL);
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_templates' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "email_templates_authenticated" ON public.email_templates;
        CREATE POLICY "email_templates_authenticated" ON public.email_templates 
        FOR ALL USING (auth.uid() IS NOT NULL);
    END IF;
END
$$;

-- System Configuration Protection
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lead_scoring_rules' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "lead_scoring_rules_authenticated" ON public.lead_scoring_rules;
        CREATE POLICY "lead_scoring_rules_authenticated" ON public.lead_scoring_rules 
        FOR ALL USING (auth.uid() IS NOT NULL);
    END IF;
END
$$;

-- Fix pending invitations policies with separate policies for different operations
DROP POLICY IF EXISTS "pending_invitations_admin_management" ON public.pending_invitations;
CREATE POLICY "pending_invitations_admin_management" ON public.pending_invitations 
FOR INSERT TO authenticated USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

DROP POLICY IF EXISTS "pending_invitations_admin_update" ON public.pending_invitations;
CREATE POLICY "pending_invitations_admin_update" ON public.pending_invitations 
FOR UPDATE TO authenticated USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

DROP POLICY IF EXISTS "pending_invitations_admin_delete" ON public.pending_invitations;
CREATE POLICY "pending_invitations_admin_delete" ON public.pending_invitations 
FOR DELETE TO authenticated USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Allow public read for invitation token validation
DROP POLICY IF EXISTS "pending_invitations_public_read" ON public.pending_invitations;
CREATE POLICY "pending_invitations_public_read" ON public.pending_invitations 
FOR SELECT USING (true);

-- Fix database function search_path for security
ALTER FUNCTION public.validate_input_security(text) SET search_path TO 'public';
ALTER FUNCTION public.has_role_secure(uuid, app_role) SET search_path TO 'public';
ALTER FUNCTION public.enhanced_log_security_event(text, text, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.create_user_invitation(text, app_role) SET search_path TO 'public';

-- Log the security enhancement
SELECT public.enhanced_log_security_event(
  'database_security_hardened',
  'high',
  'Database security policies implemented and functions hardened',
  jsonb_build_object(
    'policies_created', 'business_data_protection',
    'functions_secured', 4,
    'security_level', 'production_ready'
  )
);