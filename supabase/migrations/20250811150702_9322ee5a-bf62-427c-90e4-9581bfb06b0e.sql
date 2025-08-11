
-- 1) lead_task_engine RLS
ALTER TABLE public.lead_task_engine ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas previas si existieran
DROP POLICY IF EXISTS "engine_select_own_or_assigned" ON public.lead_task_engine;
DROP POLICY IF EXISTS "engine_insert_own" ON public.lead_task_engine;
DROP POLICY IF EXISTS "engine_update_own_or_assigned" ON public.lead_task_engine;
DROP POLICY IF EXISTS "engine_delete_own_or_assigned" ON public.lead_task_engine;

-- Ver tareas del motor si soy creador o asignado
CREATE POLICY "engine_select_own_or_assigned"
ON public.lead_task_engine
FOR SELECT
TO authenticated
USING (
  auth.uid() = created_by OR auth.uid() = assigned_to
);

-- Crear tareas del motor (el creador debe ser el usuario)
CREATE POLICY "engine_insert_own"
ON public.lead_task_engine
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Actualizar/completar/posponer si soy creador o asignado
CREATE POLICY "engine_update_own_or_assigned"
ON public.lead_task_engine
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by OR auth.uid() = assigned_to)
WITH CHECK (auth.uid() = created_by OR auth.uid() = assigned_to);

-- (Opcional) Borrar si soy creador o asignado
CREATE POLICY "engine_delete_own_or_assigned"
ON public.lead_task_engine
FOR DELETE
TO authenticated
USING (auth.uid() = created_by OR auth.uid() = assigned_to);

-- 2) Auditorías: permitir insertar (para triggers) y ver según acceso a la tarea
ALTER TABLE public.lead_task_engine_audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_insert_any_authenticated" ON public.lead_task_engine_audits;
DROP POLICY IF EXISTS "audit_select_by_task_access" ON public.lead_task_engine_audits;

-- Permitir que cualquier usuario autenticado (o trigger) inserte auditorías
CREATE POLICY "audit_insert_any_authenticated"
ON public.lead_task_engine_audits
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir ver auditorías solo si el usuario tiene acceso a la tarea
CREATE POLICY "audit_select_by_task_access"
ON public.lead_task_engine_audits
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.lead_task_engine t
    WHERE t.id = lead_task_engine_audits.task_id
      AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
  )
);
