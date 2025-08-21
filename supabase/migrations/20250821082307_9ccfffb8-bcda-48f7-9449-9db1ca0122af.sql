-- Create missing has_permission function to fix recursive RLS issues
CREATE OR REPLACE FUNCTION public.has_permission(permission_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user has admin or superadmin role
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  );
END;
$$;

-- Fix recursive RLS policy for team_members
DROP POLICY IF EXISTS "team_members_select_policy" ON public.team_members;
DROP POLICY IF EXISTS "team_members_insert_policy" ON public.team_members; 
DROP POLICY IF EXISTS "team_members_update_policy" ON public.team_members;
DROP POLICY IF EXISTS "team_members_delete_policy" ON public.team_members;

CREATE POLICY "team_members_select_policy" ON public.team_members
FOR SELECT USING (
  user_id = auth.uid() OR 
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin')
);

CREATE POLICY "team_members_insert_policy" ON public.team_members
FOR INSERT WITH CHECK (
  user_id = auth.uid() OR 
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin')
);

CREATE POLICY "team_members_update_policy" ON public.team_members
FOR UPDATE USING (
  user_id = auth.uid() OR 
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin')
);

CREATE POLICY "team_members_delete_policy" ON public.team_members
FOR DELETE USING (
  user_id = auth.uid() OR 
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin')
);

-- Fix recursive RLS policy for document_permissions
DROP POLICY IF EXISTS "document_permissions_select_policy" ON public.document_permissions;
DROP POLICY IF EXISTS "document_permissions_insert_policy" ON public.document_permissions;
DROP POLICY IF EXISTS "document_permissions_update_policy" ON public.document_permissions;
DROP POLICY IF EXISTS "document_permissions_delete_policy" ON public.document_permissions;

CREATE POLICY "document_permissions_select_policy" ON public.document_permissions
FOR SELECT USING (
  user_id = auth.uid() OR 
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin') OR
  EXISTS (
    SELECT 1 FROM documents d 
    WHERE d.id = document_permissions.document_id 
    AND d.created_by = auth.uid()
  )
);

CREATE POLICY "document_permissions_insert_policy" ON public.document_permissions
FOR INSERT WITH CHECK (
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin') OR
  EXISTS (
    SELECT 1 FROM documents d 
    WHERE d.id = document_permissions.document_id 
    AND d.created_by = auth.uid()
  )
);

CREATE POLICY "document_permissions_update_policy" ON public.document_permissions
FOR UPDATE USING (
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin') OR
  EXISTS (
    SELECT 1 FROM documents d 
    WHERE d.id = document_permissions.document_id 
    AND d.created_by = auth.uid()
  )
);

CREATE POLICY "document_permissions_delete_policy" ON public.document_permissions
FOR DELETE USING (
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin') OR
  EXISTS (
    SELECT 1 FROM documents d 
    WHERE d.id = document_permissions.document_id 
    AND d.created_by = auth.uid()
  )
);

-- Fix all database functions missing proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;