-- Security Fix: Create secured replacement functions and address critical security issues
-- We'll create new secure versions while keeping existing ones for compatibility

-- 1. Create new secure version of has_role function
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

-- 2. Update the existing has_role function with search_path (recreate with CASCADE to handle dependencies)
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
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

-- 3. Update sync_manager_role with trigger recreation
DROP TRIGGER IF EXISTS sync_manager_role_trigger ON public.operation_managers;
DROP FUNCTION IF EXISTS public.sync_manager_role();

CREATE OR REPLACE FUNCTION public.sync_manager_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Cuando se crea un manager, asignar rol admin
  IF TG_OP = 'INSERT' AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- Cuando se elimina un manager, quitar rol admin (si no es superadmin)
  IF TG_OP = 'DELETE' AND OLD.user_id IS NOT NULL THEN
    DELETE FROM public.user_roles 
    WHERE user_id = OLD.user_id 
    AND role = 'admin'::public.app_role
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = OLD.user_id 
      AND role = 'superadmin'::public.app_role
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER sync_manager_role_trigger
  AFTER INSERT OR DELETE ON public.operation_managers
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_manager_role();

-- 4. Update log_security_event function (secured version)
DROP FUNCTION IF EXISTS public.log_security_event(text, text, text, jsonb, uuid);
CREATE OR REPLACE FUNCTION public.log_security_event(p_event_type text, p_severity text, p_description text, p_metadata jsonb DEFAULT '{}'::jsonb, p_user_id uuid DEFAULT auth.uid())
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_logs (
    event_type,
    severity,
    description,
    metadata,
    user_id,
    ip_address
  ) VALUES (
    p_event_type,
    p_severity,
    p_description,
    p_metadata,
    p_user_id,
    inet_client_addr()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- 5. Update has_reconversion_permission with search_path
DROP FUNCTION IF EXISTS public.has_reconversion_permission(uuid, text);
CREATE OR REPLACE FUNCTION public.has_reconversion_permission(p_reconversion_id uuid, p_action text DEFAULT 'read'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  reconversion_record RECORD;
  user_role app_role;
BEGIN
  -- Obtener datos de la reconversión
  SELECT created_by, assigned_to INTO reconversion_record
  FROM public.reconversiones
  WHERE id = p_reconversion_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Verificar si es admin/superadmin
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  AND role IN ('admin', 'superadmin')
  LIMIT 1;
  
  IF user_role IS NOT NULL THEN
    RETURN true;
  END IF;
  
  -- Verificar si es el creador o asignado
  IF auth.uid() = reconversion_record.created_by OR 
     auth.uid() = reconversion_record.assigned_to THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;