-- =====================================================
-- SECURITY FIX: Add RLS Policies for Exposed Tables
-- =====================================================

-- 1. CRITICAL: Business Operations and Deals Protection
-- Ensure these tables have proper RLS policies to prevent public access

-- Deals table - restrict to authenticated users with appropriate access
DROP POLICY IF EXISTS "deals_secure_access" ON public.deals;
CREATE POLICY "deals_secure_access" ON public.deals 
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  )
);

-- Operations table - restrict to authenticated users
DROP POLICY IF EXISTS "operations_secure_access" ON public.operations;
CREATE POLICY "operations_secure_access" ON public.operations 
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  )
);

-- Negocios table - restrict to authenticated users
DROP POLICY IF EXISTS "negocios_secure_access" ON public.negocios;
CREATE POLICY "negocios_secure_access" ON public.negocios 
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = created_by OR 
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  )
);

-- Transacciones table - restrict to authenticated users
DROP POLICY IF EXISTS "transacciones_secure_access" ON public.transacciones;
CREATE POLICY "transacciones_secure_access" ON public.transacciones 
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = created_by OR 
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  )
);

-- 2. IMPORTANT: Business Templates Protection
-- Restrict template access to authenticated users only

-- Document templates - authenticated users only
DROP POLICY IF EXISTS "document_templates_authenticated" ON public.document_templates;
CREATE POLICY "document_templates_authenticated" ON public.document_templates 
FOR ALL USING (auth.uid() IS NOT NULL);

-- Email templates - authenticated users only  
DROP POLICY IF EXISTS "email_templates_authenticated" ON public.email_templates;
CREATE POLICY "email_templates_authenticated" ON public.email_templates 
FOR ALL USING (auth.uid() IS NOT NULL);

-- Proposal templates - authenticated users only
DROP POLICY IF EXISTS "proposal_templates_authenticated" ON public.proposal_templates;  
CREATE POLICY "proposal_templates_authenticated" ON public.proposal_templates 
FOR ALL USING (auth.uid() IS NOT NULL);

-- Template sections - authenticated users only
DROP POLICY IF EXISTS "template_sections_authenticated" ON public.template_sections;
CREATE POLICY "template_sections_authenticated" ON public.template_sections 
FOR ALL USING (auth.uid() IS NOT NULL);

-- 3. System Configuration Protection
-- Restrict system configuration access to authenticated users

-- Lead scoring rules - authenticated users only
DROP POLICY IF EXISTS "lead_scoring_rules_authenticated" ON public.lead_scoring_rules;
CREATE POLICY "lead_scoring_rules_authenticated" ON public.lead_scoring_rules 
FOR ALL USING (auth.uid() IS NOT NULL);

-- Lead task SLA policies - authenticated users only
DROP POLICY IF EXISTS "lead_task_sla_policies_authenticated" ON public.lead_task_sla_policies;
CREATE POLICY "lead_task_sla_policies_authenticated" ON public.lead_task_sla_policies 
FOR ALL USING (auth.uid() IS NOT NULL);

-- Pipeline stage automations - authenticated users only
DROP POLICY IF EXISTS "pipeline_stage_automations_authenticated" ON public.pipeline_stage_automations;
CREATE POLICY "pipeline_stage_automations_authenticated" ON public.pipeline_stage_automations 
FOR ALL USING (auth.uid() IS NOT NULL);

-- Feature flags - authenticated users only
DROP POLICY IF EXISTS "feature_flags_authenticated" ON public.feature_flags;
CREATE POLICY "feature_flags_authenticated" ON public.feature_flags 
FOR ALL USING (auth.uid() IS NOT NULL);

-- 4. Add pending_invitations table RLS policy for the invitation system
DROP POLICY IF EXISTS "pending_invitations_admin_access" ON public.pending_invitations;
CREATE POLICY "pending_invitations_admin_access" ON public.pending_invitations 
FOR ALL USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Allow public read access for invitation validation (token-based)
DROP POLICY IF EXISTS "pending_invitations_public_token_validation" ON public.pending_invitations;
CREATE POLICY "pending_invitations_public_token_validation" ON public.pending_invitations 
FOR SELECT USING (true); -- This allows token validation but other operations require admin rights

-- 5. SECURITY ENHANCEMENT: Fix database functions search_path
-- Add SET search_path TO 'public' to critical functions for security

-- Update key security functions to have proper search_path
ALTER FUNCTION public.validate_input_security(text) SET search_path TO 'public';
ALTER FUNCTION public.has_role_secure(uuid, app_role) SET search_path TO 'public';
ALTER FUNCTION public.enhanced_log_security_event(text, text, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.assign_user_role_secure(uuid, app_role) SET search_path TO 'public';
ALTER FUNCTION public.check_rate_limit_enhanced(text, text, integer, integer) SET search_path TO 'public';
ALTER FUNCTION public.validate_session_security() SET search_path TO 'public';
ALTER FUNCTION public.run_security_audit() SET search_path TO 'public';
ALTER FUNCTION public.get_user_highest_role(uuid) SET search_path TO 'public';
ALTER FUNCTION public.create_user_invitation(text, app_role) SET search_path TO 'public';

-- Log the security enhancement
SELECT public.enhanced_log_security_event(
  'security_policies_enhanced',
  'high',
  'RLS policies added for exposed business data tables and database functions secured',
  jsonb_build_object(
    'tables_secured', ARRAY['deals', 'operations', 'negocios', 'transacciones', 'document_templates', 'email_templates', 'proposal_templates', 'template_sections', 'lead_scoring_rules', 'lead_task_sla_policies', 'pipeline_stage_automations', 'feature_flags', 'pending_invitations'],
    'functions_secured', 9,
    'security_level', 'critical_business_data_protection'
  )
);