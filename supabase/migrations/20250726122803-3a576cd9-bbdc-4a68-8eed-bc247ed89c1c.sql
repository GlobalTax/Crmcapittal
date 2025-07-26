-- Critical Security Fixes - Phase 1

-- 1. Fix missing RLS policies for reconversion_documents
DROP POLICY IF EXISTS "Users can delete reconversion documents" ON public.reconversion_documents;
CREATE POLICY "Users can delete reconversion documents" 
  ON public.reconversion_documents FOR DELETE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- 2. Add missing RLS policies for reconversion_notifications
ALTER TABLE public.reconversion_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
  ON public.reconversion_notifications FOR SELECT USING (
    recipient_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "System can create notifications" 
  ON public.reconversion_notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
  ON public.reconversion_notifications FOR UPDATE USING (
    recipient_user_id = auth.uid()
  );

CREATE POLICY "Admins can delete notifications" 
  ON public.reconversion_notifications FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- 3. Fix security definer functions - add missing SET search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_user_highest_role(_user_id uuid)
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  );
$function$;

-- 4. Strengthen role management - prevent self-promotion
CREATE OR REPLACE FUNCTION public.assign_user_role(_user_id uuid, _role app_role)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  current_user_role app_role;
  result jsonb;
BEGIN
  -- Get current user's highest role
  SELECT public.get_user_highest_role(auth.uid()) INTO current_user_role;
  
  -- Validation: Only admins and superadmins can assign roles
  IF current_user_role IS NULL OR current_user_role NOT IN ('admin', 'superadmin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'No tienes permisos para asignar roles');
  END IF;
  
  -- Validation: Cannot assign role to yourself
  IF auth.uid() = _user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'No puedes asignarte roles a ti mismo');
  END IF;
  
  -- Validation: Only superadmins can assign superadmin role
  IF _role = 'superadmin' AND current_user_role != 'superadmin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Solo los superadministradores pueden asignar roles de superadministrador');
  END IF;
  
  -- Validation: Admins cannot assign admin role to users who already have superadmin
  IF _role = 'admin' AND current_user_role = 'admin' THEN
    IF EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = _user_id AND role = 'superadmin'
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', 'No puedes asignar rol admin a un superadministrador');
    END IF;
  END IF;
  
  -- Insert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log the role assignment for audit
  PERFORM public.log_security_event(
    'user_role_assigned',
    'medium',
    'Rol de usuario asignado: ' || _role::text,
    jsonb_build_object(
      'target_user_id', _user_id,
      'assigned_role', _role,
      'assigned_by', auth.uid()
    )
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Rol asignado exitosamente');
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'Error al asignar rol: ' || SQLERRM);
END;
$function$;

-- 5. Add comprehensive security logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_severity text,
  p_description text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  log_id uuid;
  current_user_email text;
BEGIN
  -- Get current user email
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = auth.uid();

  INSERT INTO public.security_logs (
    event_type,
    severity,
    description,
    user_id,
    user_email,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    p_event_type,
    p_severity,
    p_description,
    auth.uid(),
    current_user_email,
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb->>'user-agent',
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- 6. Create security_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  description TEXT NOT NULL,
  user_id UUID,
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security_logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only superadmins can view security logs
CREATE POLICY "Only superadmins can view security logs" 
  ON public.security_logs FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'superadmin'
    )
  );

-- System can insert security logs
CREATE POLICY "System can create security logs" 
  ON public.security_logs FOR INSERT WITH CHECK (true);

-- 7. Add stricter RLS policies to user_roles to prevent direct manipulation
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
  ON public.user_roles FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'superadmin')
    )
  );

-- Prevent direct INSERT/UPDATE/DELETE on user_roles - force use of functions
CREATE POLICY "Prevent direct role manipulation" 
  ON public.user_roles FOR INSERT WITH CHECK (false);

CREATE POLICY "Prevent direct role updates" 
  ON public.user_roles FOR UPDATE USING (false);

CREATE POLICY "Prevent direct role deletion" 
  ON public.user_roles FOR DELETE USING (false);

-- Create triggers to audit role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_security_event(
      'role_assigned',
      'medium',
      'Rol asignado: ' || NEW.role::text,
      jsonb_build_object(
        'user_id', NEW.user_id,
        'role', NEW.role,
        'operation', 'INSERT'
      )
    );
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    PERFORM public.log_security_event(
      'role_removed',
      'medium',
      'Rol removido: ' || OLD.role::text,
      jsonb_build_object(
        'user_id', OLD.user_id,
        'role', OLD.role,
        'operation', 'DELETE'
      )
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- Create audit trigger for user_roles
DROP TRIGGER IF EXISTS trigger_audit_role_changes ON public.user_roles;
CREATE TRIGGER trigger_audit_role_changes
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();