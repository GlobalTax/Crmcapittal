-- CRITICAL SECURITY FIXES: Comprehensive Database Security Enhancement

-- ================================
-- PHASE 1: Enable RLS on Missing Tables
-- ================================

-- Enable RLS on tables that don't have it
ALTER TABLE public.commission_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_escrow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborator_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborator_territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negocios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- ================================
-- PHASE 2: Create Comprehensive RLS Policies
-- ================================

-- DEALS TABLE - Critical business data protection
CREATE POLICY "users_view_own_deals" ON public.deals
  FOR SELECT USING (
    auth.uid() = created_by OR 
    auth.uid() = manager_id OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

CREATE POLICY "users_create_deals" ON public.deals
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "users_update_own_deals" ON public.deals
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() = manager_id OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

CREATE POLICY "admins_delete_deals" ON public.deals
  FOR DELETE USING (
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

-- OPERATIONS TABLE - M&A operations protection
CREATE POLICY "users_view_operations" ON public.operations
  FOR SELECT USING (
    auth.uid() = created_by OR
    auth.uid() = manager_id OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

CREATE POLICY "users_create_operations" ON public.operations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "users_update_operations" ON public.operations
  FOR UPDATE USING (
    auth.uid() = created_by OR
    auth.uid() = manager_id OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

CREATE POLICY "admins_delete_operations" ON public.operations
  FOR DELETE USING (
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

-- DOCUMENTS TABLE - Document access control
CREATE POLICY "users_view_documents" ON public.documents
  FOR SELECT USING (
    auth.uid() = created_by OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role) OR
    -- Allow if user has document permissions
    EXISTS (
      SELECT 1 FROM public.document_permissions dp
      WHERE dp.document_id = documents.id 
      AND dp.user_id = auth.uid()
      AND (dp.expires_at IS NULL OR dp.expires_at > now())
    )
  );

CREATE POLICY "users_create_documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "users_update_documents" ON public.documents
  FOR UPDATE USING (
    auth.uid() = created_by OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.document_permissions dp
      WHERE dp.document_id = documents.id 
      AND dp.user_id = auth.uid()
      AND dp.permission_type IN ('owner', 'editor')
      AND (dp.expires_at IS NULL OR dp.expires_at > now())
    )
  );

CREATE POLICY "users_delete_documents" ON public.documents
  FOR DELETE USING (
    auth.uid() = created_by OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

-- DOCUMENT TEMPLATES - Template access control
CREATE POLICY "users_view_document_templates" ON public.document_templates
  FOR SELECT USING (
    auth.uid() = created_by OR
    is_public = true OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

CREATE POLICY "users_create_document_templates" ON public.document_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "users_update_document_templates" ON public.document_templates
  FOR UPDATE USING (
    auth.uid() = created_by OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

CREATE POLICY "users_delete_document_templates" ON public.document_templates
  FOR DELETE USING (
    auth.uid() = created_by OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

-- NEGOCIOS TABLE - Business negotiations protection
CREATE POLICY "users_view_negocios" ON public.negocios
  FOR SELECT USING (
    auth.uid() = created_by OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

CREATE POLICY "users_manage_negocios" ON public.negocios
  FOR ALL USING (
    auth.uid() = created_by OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

-- TRANSACCIONES TABLE - Financial transactions protection
CREATE POLICY "users_view_transacciones" ON public.transacciones
  FOR SELECT USING (
    auth.uid() = created_by OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

CREATE POLICY "users_manage_transacciones" ON public.transacciones
  FOR ALL USING (
    auth.uid() = created_by OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

-- COMMISSION CALCULATIONS - Financial calculations protection
CREATE POLICY "users_view_commission_calculations" ON public.commission_calculations
  FOR SELECT USING (
    auth.uid() = collaborator_id OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role) OR
    -- Allow if user is related to the deal
    EXISTS (
      SELECT 1 FROM public.deals d
      WHERE d.id = commission_calculations.deal_id 
      AND (d.created_by = auth.uid() OR d.manager_id = auth.uid())
    )
  );

CREATE POLICY "admins_manage_commission_calculations" ON public.commission_calculations
  FOR ALL USING (
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

-- COMMISSION ESCROW - Escrow management
CREATE POLICY "users_view_commission_escrow" ON public.commission_escrow
  FOR SELECT USING (
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.commissions c
      WHERE c.id = commission_escrow.commission_id 
      AND (c.collaborator_id = auth.uid() OR c.employee_id = auth.uid())
    )
  );

CREATE POLICY "admins_manage_commission_escrow" ON public.commission_escrow
  FOR ALL USING (
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

-- COLLABORATOR PERFORMANCE - Performance metrics
CREATE POLICY "users_view_collaborator_performance" ON public.collaborator_performance
  FOR SELECT USING (
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.collaborators c
      WHERE c.id = collaborator_performance.collaborator_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "admins_manage_collaborator_performance" ON public.collaborator_performance
  FOR ALL USING (
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

-- COLLABORATOR TERRITORIES - Territory assignments
CREATE POLICY "users_view_collaborator_territories" ON public.collaborator_territories
  FOR SELECT USING (
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.collaborators c
      WHERE c.id = collaborator_territories.collaborator_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "admins_manage_collaborator_territories" ON public.collaborator_territories
  FOR ALL USING (
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

-- TERRITORIES - Territory management
CREATE POLICY "users_view_territories" ON public.territories
  FOR SELECT USING (true); -- Territories can be viewed by all authenticated users

CREATE POLICY "admins_manage_territories" ON public.territories
  FOR ALL USING (
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

-- ================================
-- PHASE 3: Database Function Hardening
-- ================================

-- Update functions to include search_path for security
CREATE OR REPLACE FUNCTION public.get_quantum_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  config jsonb := '{}'::jsonb;
BEGIN
  -- Safely retrieve Quantum Economics configuration from secrets
  SELECT jsonb_build_object(
    'token', COALESCE(ds1.decrypted_secret, ''),
    'base_url', COALESCE(ds2.decrypted_secret, 'https://api.quantum-economics.com')
  ) INTO config
  FROM vault.decrypted_secrets ds1
  FULL OUTER JOIN vault.decrypted_secrets ds2 ON ds2.name = 'QUANTUM_BASE_URL'
  WHERE ds1.name = 'QUANTUM_TOKEN';
  
  RETURN config;
EXCEPTION
  WHEN OTHERS THEN
    -- Log security event for failed config retrieval
    PERFORM public.enhanced_log_security_event(
      'quantum_config_retrieval_failed',
      'high',
      'Failed to retrieve Quantum configuration: ' || SQLERRM,
      jsonb_build_object('error', SQLERRM)
    );
    RETURN '{}'::jsonb;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_einforma_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  config jsonb := '{}'::jsonb;
BEGIN
  -- Safely retrieve eInforma configuration from secrets
  SELECT jsonb_build_object(
    'client_id', COALESCE(ds1.decrypted_secret, ''),
    'client_secret', COALESCE(ds2.decrypted_secret, ''),
    'base_url', COALESCE(ds3.decrypted_secret, 'https://api.einforma.com')
  ) INTO config
  FROM vault.decrypted_secrets ds1
  FULL OUTER JOIN vault.decrypted_secrets ds2 ON ds2.name = 'EINFORMA_CLIENT_SECRET'
  FULL OUTER JOIN vault.decrypted_secrets ds3 ON ds3.name = 'EINFORMA_BASE_URL'
  WHERE ds1.name = 'EINFORMA_CLIENT_ID';
  
  RETURN config;
EXCEPTION
  WHEN OTHERS THEN
    -- Log security event for failed config retrieval
    PERFORM public.enhanced_log_security_event(
      'einforma_config_retrieval_failed',
      'high',
      'Failed to retrieve eInforma configuration: ' || SQLERRM,
      jsonb_build_object('error', SQLERRM)
    );
    RETURN '{}'::jsonb;
END;
$$;

-- ================================
-- PHASE 4: Security Event Logging
-- ================================

-- Log this security enhancement
SELECT public.enhanced_log_security_event(
  'comprehensive_security_enhancement_applied',
  'high',
  'Applied comprehensive security fixes: RLS policies for 11 tables, function hardening, and access control improvements',
  jsonb_build_object(
    'tables_secured', jsonb_build_array(
      'deals', 'operations', 'negocios', 'transacciones', 
      'documents', 'document_templates', 'commission_calculations',
      'commission_escrow', 'collaborator_performance', 
      'collaborator_territories', 'territories'
    ),
    'functions_hardened', jsonb_build_array(
      'get_quantum_config', 'get_einforma_config'
    ),
    'security_level', 'critical_vulnerabilities_addressed'
  )
);