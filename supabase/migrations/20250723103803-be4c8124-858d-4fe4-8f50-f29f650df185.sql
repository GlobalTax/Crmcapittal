
-- Agregar columna assigned_to a reconversiones si no existe
ALTER TABLE public.reconversiones 
ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id);

-- Crear tabla para logs de auditoría de reconversiones
CREATE TABLE IF NOT EXISTS public.reconversion_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reconversion_id uuid NOT NULL REFERENCES public.reconversiones(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_description text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  user_id uuid NOT NULL,
  user_email text,
  ip_address inet,
  user_agent text,
  severity text DEFAULT 'info',
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS en reconversion_audit_logs
ALTER TABLE public.reconversion_audit_logs ENABLE ROW LEVEL SECURITY;

-- Actualizar políticas RLS para reconversiones (más restrictivas)
DROP POLICY IF EXISTS "Users can view reconversiones they created or admin" ON public.reconversiones;
DROP POLICY IF EXISTS "Users can create reconversiones" ON public.reconversiones;
DROP POLICY IF EXISTS "Users can update reconversiones they created or admin" ON public.reconversiones;
DROP POLICY IF EXISTS "Admin users can delete reconversiones" ON public.reconversiones;

-- Nuevas políticas RLS más seguras para reconversiones
CREATE POLICY "Users can view reconversiones they created, are assigned to, or admin"
ON public.reconversiones FOR SELECT
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can create reconversiones"
ON public.reconversiones FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update reconversiones they created, are assigned to, or admin"
ON public.reconversiones FOR UPDATE
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Only admin users can delete reconversiones"
ON public.reconversiones FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Políticas RLS para audit logs (solo admins pueden ver)
CREATE POLICY "Only admins can view audit logs"
ON public.reconversion_audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "System can create audit logs"
ON public.reconversion_audit_logs FOR INSERT
WITH CHECK (true);

-- Función para registrar logs de auditoría de reconversiones
CREATE OR REPLACE FUNCTION public.log_reconversion_audit(
  p_reconversion_id uuid,
  p_action_type text,
  p_action_description text,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL,
  p_severity text DEFAULT 'info',
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  log_id uuid;
  current_user_email text;
BEGIN
  -- Obtener email del usuario actual
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = auth.uid();

  INSERT INTO public.reconversion_audit_logs (
    reconversion_id,
    action_type,
    action_description,
    old_data,
    new_data,
    user_id,
    user_email,
    ip_address,
    severity,
    metadata
  ) VALUES (
    p_reconversion_id,
    p_action_type,
    p_action_description,
    p_old_data,
    p_new_data,
    auth.uid(),
    current_user_email,
    inet_client_addr(),
    p_severity,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- Función para validar permisos de reconversión
CREATE OR REPLACE FUNCTION public.has_reconversion_permission(
  p_reconversion_id uuid,
  p_action text DEFAULT 'read'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Trigger para auditoría automática en reconversiones
CREATE OR REPLACE FUNCTION public.trigger_reconversion_audit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_reconversion_audit(
      NEW.id,
      'created',
      'Reconversión creada',
      NULL,
      to_jsonb(NEW),
      'info',
      jsonb_build_object('trigger_operation', TG_OP)
    );
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    -- Solo registrar si hay cambios significativos
    IF OLD.status != NEW.status OR 
       OLD.company_name != NEW.company_name OR 
       OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      PERFORM public.log_reconversion_audit(
        NEW.id,
        'updated',
        'Reconversión actualizada',
        to_jsonb(OLD),
        to_jsonb(NEW),
        'info',
        jsonb_build_object('trigger_operation', TG_OP)
      );
    END IF;
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    PERFORM public.log_reconversion_audit(
      OLD.id,
      'deleted',
      'Reconversión eliminada',
      to_jsonb(OLD),
      NULL,
      'high',
      jsonb_build_object('trigger_operation', TG_OP)
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- Crear el trigger
DROP TRIGGER IF EXISTS reconversion_audit_trigger ON public.reconversiones;
CREATE TRIGGER reconversion_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reconversiones
  FOR EACH ROW EXECUTE FUNCTION public.trigger_reconversion_audit();

-- Función para sanitizar datos de reconversión
CREATE OR REPLACE FUNCTION public.sanitize_reconversion_data(
  p_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $function$
DECLARE
  sanitized_data jsonb := p_data;
BEGIN
  -- Sanitizar campos de texto (remover HTML, scripts, etc.)
  IF sanitized_data ? 'company_name' THEN
    sanitized_data := jsonb_set(
      sanitized_data,
      '{company_name}',
      to_jsonb(regexp_replace(sanitized_data->>'company_name', '<[^>]*>', '', 'g'))
    );
  END IF;
  
  IF sanitized_data ? 'original_rejection_reason' THEN
    sanitized_data := jsonb_set(
      sanitized_data,
      '{original_rejection_reason}',
      to_jsonb(regexp_replace(sanitized_data->>'original_rejection_reason', '<[^>]*>', '', 'g'))
    );
  END IF;
  
  -- Validar rangos numéricos
  IF sanitized_data ? 'investment_capacity_min' THEN
    IF (sanitized_data->>'investment_capacity_min')::numeric < 0 THEN
      sanitized_data := jsonb_set(sanitized_data, '{investment_capacity_min}', '0');
    END IF;
  END IF;
  
  IF sanitized_data ? 'investment_capacity_max' THEN
    IF (sanitized_data->>'investment_capacity_max')::numeric < 0 THEN
      sanitized_data := jsonb_set(sanitized_data, '{investment_capacity_max}', '0');
    END IF;
  END IF;
  
  RETURN sanitized_data;
END;
$function$;

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_reconversion_audit_logs_reconversion_id ON public.reconversion_audit_logs(reconversion_id);
CREATE INDEX IF NOT EXISTS idx_reconversion_audit_logs_user_id ON public.reconversion_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_reconversion_audit_logs_created_at ON public.reconversion_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_reconversiones_assigned_to ON public.reconversiones(assigned_to);
