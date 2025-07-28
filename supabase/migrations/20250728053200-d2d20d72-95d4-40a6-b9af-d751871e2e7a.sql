-- CRITICAL SECURITY FIXES - Phase 1: Database Security

-- Fix 1: Remove dangerous user role self-assignment policy
DROP POLICY IF EXISTS "users_insert_own_roles" ON public.user_roles;

-- Fix 2: Create secure role assignment function
CREATE OR REPLACE FUNCTION public.assign_user_role_secure(_target_user_id uuid, _role app_role)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  
  -- Validation: Cannot assign roles to yourself
  IF auth.uid() = _target_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'No puedes asignarte roles a ti mismo');
  END IF;
  
  -- Validation: Only superadmins can assign superadmin role
  IF _role = 'superadmin' AND current_user_role != 'superadmin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Solo los superadministradores pueden asignar roles de superadministrador');
  END IF;
  
  -- Validation: User must exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _target_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuario no encontrado');
  END IF;
  
  -- Insert the role (ignore if already exists)
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (_target_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log the role assignment for security audit
  PERFORM public.log_security_event(
    'role_assigned_secure',
    'high',
    'Rol asignado de forma segura: ' || _role::text,
    jsonb_build_object(
      'target_user_id', _target_user_id,
      'assigned_role', _role,
      'assigned_by', auth.uid()
    )
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Rol asignado exitosamente');
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the failed attempt
    PERFORM public.log_security_event(
      'role_assignment_failed',
      'high',
      'Error al asignar rol: ' || SQLERRM,
      jsonb_build_object(
        'target_user_id', _target_user_id,
        'attempted_role', _role,
        'attempted_by', auth.uid(),
        'error', SQLERRM
      )
    );
    RETURN jsonb_build_object('success', false, 'error', 'Error interno al asignar rol');
END;
$$;

-- Fix 3: Update user_roles RLS policies to be more restrictive
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

-- More secure RLS policies for user_roles
CREATE POLICY "Users can view their own roles only" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (
  auth.uid() != user_id AND 
  (has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin'))
);

CREATE POLICY "No direct role insertion allowed" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (false); -- Force use of secure function

CREATE POLICY "No direct role updates allowed" 
ON public.user_roles 
FOR UPDATE 
USING (false); -- Force use of secure function

CREATE POLICY "Only superadmins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (has_role_secure(auth.uid(), 'superadmin'));

-- Fix 4: Add rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(identifier, window_start)
);

-- RLS for rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage rate limits" 
ON public.rate_limits 
FOR ALL 
USING (true);

-- Fix 5: Create secure rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_max_requests integer DEFAULT 100,
  p_window_minutes integer DEFAULT 60
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_window timestamp with time zone;
  current_count integer;
BEGIN
  -- Calculate current window start (truncated to the minute)
  current_window := date_trunc('minute', now() - (now()::time)::interval % (p_window_minutes || ' minutes')::interval);
  
  -- Get or create current window count
  INSERT INTO public.rate_limits (identifier, window_start, request_count)
  VALUES (p_identifier, current_window, 1)
  ON CONFLICT (identifier, window_start) 
  DO UPDATE SET 
    request_count = rate_limits.request_count + 1,
    created_at = now()
  RETURNING request_count INTO current_count;
  
  -- Clean up old windows (older than 24 hours)
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - interval '24 hours';
  
  -- Return true if under limit
  RETURN current_count <= p_max_requests;
END;
$$;

-- Fix 6: Secure input validation function
CREATE OR REPLACE FUNCTION public.sanitize_input(p_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
BEGIN
  IF p_input IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove dangerous characters and patterns
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(p_input, '<[^>]*>', '', 'g'), -- Remove HTML tags
        '[''";\\\\]', '', 'g'), -- Remove SQL injection chars
      '[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', '', 'g'), -- Remove control chars
    '(script|javascript|vbscript|onload|onerror)', '', 'gi'); -- Remove script references
END;
$$;