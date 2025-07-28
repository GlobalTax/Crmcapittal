-- Critical Security Fixes Migration
-- Fix 1: Add search_path to all functions that need it for security

-- Fix search_path for existing functions
CREATE OR REPLACE FUNCTION public.update_reconversion_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_valoracion_task_completed_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Set completed_at when task is marked as completed
  IF NEW.completed = true AND OLD.completed = false THEN
    NEW.completed_at = now();
  -- Clear completed_at when task is marked as not completed
  ELSIF NEW.completed = false AND OLD.completed = true THEN
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_company_file_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_contact_file_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_contact_task_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_transaction_tasks_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_transaction_people_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_time_entry_duration()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Fix 2: Add secure role checking function with proper search path
CREATE OR REPLACE FUNCTION public.has_role_secure(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Fix 3: Improve RLS policies for contacts table to be more restrictive
DROP POLICY IF EXISTS "Users can view all contacts" ON public.contacts;
CREATE POLICY "Users can view relevant contacts" ON public.contacts 
FOR SELECT 
USING (
  auth.uid() = created_by 
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Fix 4: Optimize user_roles policies to remove conflicts
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin users can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin users can manage roles" ON public.user_roles;

-- Create consolidated, secure policies for user_roles
CREATE POLICY "Users can view roles" ON public.user_roles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR has_role_secure(auth.uid(), 'admin'::app_role)
  OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Only admins can insert roles" ON public.user_roles 
FOR INSERT 
WITH CHECK (
  has_role_secure(auth.uid(), 'admin'::app_role)
  OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Only admins can update roles" ON public.user_roles 
FOR UPDATE 
USING (
  has_role_secure(auth.uid(), 'admin'::app_role)
  OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Only admins can delete roles" ON public.user_roles 
FOR DELETE 
USING (
  has_role_secure(auth.uid(), 'admin'::app_role)
  OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Fix 5: Add enhanced security logging
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_event_type text, 
  p_severity text DEFAULT 'medium'::text, 
  p_description text DEFAULT ''::text, 
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_table_name text DEFAULT NULL
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  log_id uuid;
  user_email text;
  client_ip text;
BEGIN
  -- Get user email if available
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Get client IP safely
  BEGIN
    client_ip := inet_client_addr()::text;
  EXCEPTION
    WHEN others THEN
      client_ip := 'unknown';
  END;
  
  -- Insert security log with enhanced metadata
  INSERT INTO public.security_logs (
    event_type,
    severity,
    description,
    metadata,
    user_id,
    user_email,
    ip_address
  ) VALUES (
    p_event_type,
    p_severity,
    p_description,
    p_metadata || jsonb_build_object(
      'table_name', p_table_name,
      'function_called', 'log_security_event_enhanced',
      'timestamp_utc', now(),
      'client_info', COALESCE(current_setting('request.header.user-agent', true), 'unknown')
    ),
    auth.uid(),
    user_email,
    client_ip
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- Fix 6: Add input sanitization function with enhanced security
CREATE OR REPLACE FUNCTION public.sanitize_input_enhanced(p_input text, p_max_length integer DEFAULT 1000)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_input IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Length check
  IF length(p_input) > p_max_length THEN
    RAISE EXCEPTION 'Input too long. Maximum % characters allowed.', p_max_length;
  END IF;
  
  -- Enhanced sanitization
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(p_input, 
            '<[^>]*>', '', 'g'), -- Remove HTML tags
          '[''";\\\\]', '', 'g'), -- Remove SQL injection chars
        '[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', '', 'g'), -- Remove control chars
      '(script|javascript|vbscript|onload|onerror|eval|expression)', '', 'gi'), -- Remove script references
    '(union|select|insert|update|delete|drop|create|alter|exec|execute)(\s|$)', '', 'gi'); -- Remove SQL keywords
END;
$function$;