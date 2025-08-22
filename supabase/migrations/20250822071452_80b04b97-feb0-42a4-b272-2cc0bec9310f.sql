-- =====================================================
-- SECURITY FIX: Add RLS Policies for Exposed Tables (Corrected)
-- =====================================================

-- 1. CRITICAL: Business Operations and Deals Protection
-- Fix RLS policies based on actual table structure

-- Deals table - restrict to authenticated users with creator access
DROP POLICY IF EXISTS "deals_secure_access" ON public.deals;
CREATE POLICY "deals_secure_access" ON public.deals 
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = created_by OR
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

-- 4. Pending invitations security
DROP POLICY IF EXISTS "pending_invitations_admin_access" ON public.pending_invitations;
CREATE POLICY "pending_invitations_admin_access" ON public.pending_invitations 
FOR INSERT, UPDATE, DELETE USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Allow public read for invitation token validation
DROP POLICY IF EXISTS "pending_invitations_public_token_validation" ON public.pending_invitations;
CREATE POLICY "pending_invitations_public_token_validation" ON public.pending_invitations 
FOR SELECT USING (true);

-- Log the security enhancement
SELECT public.enhanced_log_security_event(
  'critical_security_policies_applied',
  'high',
  'RLS policies applied to protect business-critical data from public access',
  jsonb_build_object(
    'tables_secured', ARRAY['deals', 'operations', 'negocios', 'transacciones', 'document_templates', 'email_templates', 'proposal_templates', 'template_sections', 'lead_scoring_rules', 'lead_task_sla_policies', 'pipeline_stage_automations', 'feature_flags', 'pending_invitations'],
    'security_level', 'critical_business_data_protection',
    'fix_type', 'rls_policy_enforcement'
  )
);