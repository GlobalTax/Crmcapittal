-- Agregar políticas RLS faltantes para pipeline_stages para permitir edición

-- Permitir a los usuarios crear nuevas etapas
CREATE POLICY "Users can create pipeline stages" ON public.pipeline_stages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir a los usuarios actualizar etapas existentes
CREATE POLICY "Users can update pipeline stages" ON public.pipeline_stages
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir a los usuarios eliminar etapas (marcar como inactivo)
CREATE POLICY "Users can delete pipeline stages" ON public.pipeline_stages
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Verificar que existe la función has_role_secure y crear si no existe
CREATE OR REPLACE FUNCTION public.has_role_secure(_user_id uuid, _role app_role)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path TO 'public';