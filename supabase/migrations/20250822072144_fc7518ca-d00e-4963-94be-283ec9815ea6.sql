-- =====================================================
-- ESSENTIAL SECURITY FIX: RLS Policies Only
-- =====================================================

-- Fix pending invitations access policies
DROP POLICY IF EXISTS "pending_invitations_admin_insert" ON public.pending_invitations;
CREATE POLICY "pending_invitations_admin_insert" ON public.pending_invitations 
FOR INSERT TO authenticated 
WITH CHECK (
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

DROP POLICY IF EXISTS "pending_invitations_admin_update" ON public.pending_invitations;
CREATE POLICY "pending_invitations_admin_update" ON public.pending_invitations 
FOR UPDATE TO authenticated 
USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

DROP POLICY IF EXISTS "pending_invitations_admin_delete" ON public.pending_invitations;
CREATE POLICY "pending_invitations_admin_delete" ON public.pending_invitations 
FOR DELETE TO authenticated 
USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Allow public read for invitation token validation
DROP POLICY IF EXISTS "pending_invitations_public_read" ON public.pending_invitations;
CREATE POLICY "pending_invitations_public_read" ON public.pending_invitations 
FOR SELECT USING (true);

-- Basic protection for critical business tables (authenticated users only)
DO $$
BEGIN
    -- Protect deals table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'deals' AND table_schema = 'public') THEN
        ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "deals_authenticated_only" ON public.deals;
        CREATE POLICY "deals_authenticated_only" ON public.deals 
        FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);
    END IF;
    
    -- Protect operations table if it exists  
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'operations' AND table_schema = 'public') THEN
        ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "operations_authenticated_only" ON public.operations;
        CREATE POLICY "operations_authenticated_only" ON public.operations 
        FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);
    END IF;
END
$$;