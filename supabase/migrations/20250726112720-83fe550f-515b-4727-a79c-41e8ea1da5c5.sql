-- Fix RLS policies for better security

-- Ensure all tables have proper policies
-- Fix reconversion_audit_logs to only allow reading own records for non-admins
DROP POLICY IF EXISTS "Users can view reconversion audit logs" ON public.reconversion_audit_logs;
CREATE POLICY "Users can view reconversion audit logs" ON public.reconversion_audit_logs
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Add missing RLS policies for reconversion_notifications
ALTER TABLE public.reconversion_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.reconversion_notifications
  FOR SELECT USING (recipient_user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.reconversion_notifications
  FOR INSERT WITH CHECK (true);

-- Secure valoracion_security_logs
ALTER TABLE public.valoracion_security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view valoracion security logs" ON public.valoracion_security_logs
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "System can create valoracion security logs" ON public.valoracion_security_logs
  FOR INSERT WITH CHECK (true);

-- Add security definer function for getting current user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1;
$$;

-- Update existing function to be safer
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;