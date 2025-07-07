-- Fix sync_manager_role trigger error with app_role type

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS sync_manager_role ON public.operation_managers;
DROP FUNCTION IF EXISTS public.sync_manager_role();

-- Recreate the function with proper search_path
CREATE OR REPLACE FUNCTION public.sync_manager_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Recreate the trigger
CREATE TRIGGER sync_manager_role
  AFTER INSERT OR DELETE ON public.operation_managers
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_manager_role();