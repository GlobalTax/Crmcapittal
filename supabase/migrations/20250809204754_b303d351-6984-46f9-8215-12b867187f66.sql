-- Fix RLS update policy and add trigger to enforce reassignment permissions

DROP POLICY IF EXISTS "engine_update_visible" ON public.lead_task_engine;
CREATE POLICY "engine_update_visible" ON public.lead_task_engine FOR UPDATE USING (
  created_by = auth.uid() OR assigned_to = auth.uid() OR has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
) WITH CHECK (true);

-- Trigger to enforce reassignment by owner/managers only
CREATE OR REPLACE FUNCTION public.enforce_engine_task_reassignment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  is_admin boolean;
BEGIN
  IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
    is_admin := has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role);
    IF NOT (is_admin OR OLD.created_by = auth.uid()) THEN
      RAISE EXCEPTION 'Solo el creador de la tarea o managers pueden reasignar';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_engine_task_reassignment ON public.lead_task_engine;
CREATE TRIGGER trg_enforce_engine_task_reassignment
BEFORE UPDATE OF assigned_to ON public.lead_task_engine
FOR EACH ROW EXECUTE FUNCTION public.enforce_engine_task_reassignment();