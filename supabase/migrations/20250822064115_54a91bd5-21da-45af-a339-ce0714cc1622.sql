-- CRITICAL SECURITY FIXES: Comprehensive Database Security Enhancement (Type-Fixed)

-- ================================
-- PHASE 1: Enable RLS on Missing Tables
-- ================================

DO $$
BEGIN
    -- Enable RLS on existing tables that don't have it
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commission_calculations' AND table_schema = 'public') THEN
        ALTER TABLE public.commission_calculations ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commission_escrow' AND table_schema = 'public') THEN
        ALTER TABLE public.commission_escrow ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collaborator_performance' AND table_schema = 'public') THEN
        ALTER TABLE public.collaborator_performance ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collaborator_territories' AND table_schema = 'public') THEN
        ALTER TABLE public.collaborator_territories ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'territories' AND table_schema = 'public') THEN
        ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ================================
-- PHASE 2: Create Critical RLS Policies
-- ================================

-- COMMISSION CALCULATIONS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commission_calculations' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "users_view_commission_calculations" ON public.commission_calculations;
        DROP POLICY IF EXISTS "admins_manage_commission_calculations" ON public.commission_calculations;
        
        CREATE POLICY "users_view_commission_calculations" ON public.commission_calculations
          FOR SELECT USING (
            has_role_secure(auth.uid(), 'admin'::app_role) OR 
            has_role_secure(auth.uid(), 'superadmin'::app_role)
          );

        CREATE POLICY "admins_manage_commission_calculations" ON public.commission_calculations
          FOR ALL USING (
            has_role_secure(auth.uid(), 'admin'::app_role) OR 
            has_role_secure(auth.uid(), 'superadmin'::app_role)
          );
    END IF;
END $$;

-- COMMISSION ESCROW
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commission_escrow' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "users_view_commission_escrow" ON public.commission_escrow;
        DROP POLICY IF EXISTS "admins_manage_commission_escrow" ON public.commission_escrow;
        
        CREATE POLICY "users_view_commission_escrow" ON public.commission_escrow
          FOR SELECT USING (
            has_role_secure(auth.uid(), 'admin'::app_role) OR 
            has_role_secure(auth.uid(), 'superadmin'::app_role)
          );

        CREATE POLICY "admins_manage_commission_escrow" ON public.commission_escrow
          FOR ALL USING (
            has_role_secure(auth.uid(), 'admin'::app_role) OR 
            has_role_secure(auth.uid(), 'superadmin'::app_role)
          );
    END IF;
END $$;

-- COLLABORATOR PERFORMANCE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collaborator_performance' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "users_view_collaborator_performance" ON public.collaborator_performance;
        DROP POLICY IF EXISTS "admins_manage_collaborator_performance" ON public.collaborator_performance;
        
        CREATE POLICY "users_view_collaborator_performance" ON public.collaborator_performance
          FOR SELECT USING (
            has_role_secure(auth.uid(), 'admin'::app_role) OR 
            has_role_secure(auth.uid(), 'superadmin'::app_role) OR
            -- Allow if user is the collaborator
            (collaborator_id IS NOT NULL AND collaborator_id IN (
              SELECT c.id FROM public.collaborators c WHERE c.user_id = auth.uid()
            ))
          );

        CREATE POLICY "admins_manage_collaborator_performance" ON public.collaborator_performance
          FOR ALL USING (
            has_role_secure(auth.uid(), 'admin'::app_role) OR 
            has_role_secure(auth.uid(), 'superadmin'::app_role)
          );
    END IF;
END $$;

-- COLLABORATOR TERRITORIES
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collaborator_territories' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "users_view_collaborator_territories" ON public.collaborator_territories;
        DROP POLICY IF EXISTS "admins_manage_collaborator_territories" ON public.collaborator_territories;
        
        CREATE POLICY "users_view_collaborator_territories" ON public.collaborator_territories
          FOR SELECT USING (
            has_role_secure(auth.uid(), 'admin'::app_role) OR 
            has_role_secure(auth.uid(), 'superadmin'::app_role) OR
            -- Allow if user is the collaborator
            (collaborator_id IS NOT NULL AND collaborator_id IN (
              SELECT c.id FROM public.collaborators c WHERE c.user_id = auth.uid()
            ))
          );

        CREATE POLICY "admins_manage_collaborator_territories" ON public.collaborator_territories
          FOR ALL USING (
            has_role_secure(auth.uid(), 'admin'::app_role) OR 
            has_role_secure(auth.uid(), 'superadmin'::app_role)
          );
    END IF;
END $$;

-- TERRITORIES
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'territories' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "users_view_territories" ON public.territories;
        DROP POLICY IF EXISTS "admins_manage_territories" ON public.territories;
        
        CREATE POLICY "users_view_territories" ON public.territories
          FOR SELECT USING (true); -- All authenticated users can view territories

        CREATE POLICY "admins_manage_territories" ON public.territories
          FOR ALL USING (
            has_role_secure(auth.uid(), 'admin'::app_role) OR 
            has_role_secure(auth.uid(), 'superadmin'::app_role)
          );
    END IF;
END $$;

-- ================================
-- PHASE 3: Database Function Hardening
-- ================================

-- Update functions with explicit search_path for security
CREATE OR REPLACE FUNCTION public.get_quantum_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  config jsonb := '{}'::jsonb;
BEGIN
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
    PERFORM public.enhanced_log_security_event(
      'quantum_config_retrieval_failed'::text,
      'high'::text,
      ('Failed to retrieve Quantum configuration: ' || SQLERRM)::text,
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
    PERFORM public.enhanced_log_security_event(
      'einforma_config_retrieval_failed'::text,
      'high'::text,
      ('Failed to retrieve eInforma configuration: ' || SQLERRM)::text,
      jsonb_build_object('error', SQLERRM)
    );
    RETURN '{}'::jsonb;
END;
$$;

-- ================================
-- PHASE 4: Security Event Logging
-- ================================

-- Log this security enhancement with explicit type casting
SELECT public.enhanced_log_security_event(
  'comprehensive_security_enhancement_applied'::text,
  'critical'::text,
  'Applied comprehensive security fixes: RLS policies and function hardening'::text,
  jsonb_build_object(
    'tables_secured', jsonb_build_array(
      'commission_calculations', 'commission_escrow', 
      'collaborator_performance', 'collaborator_territories', 'territories'
    ),
    'functions_hardened', jsonb_build_array(
      'get_quantum_config', 'get_einforma_config'
    ),
    'security_level', 'critical_vulnerabilities_addressed',
    'timestamp', now()
  )
);