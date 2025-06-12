
-- Actualizar las restricciones del campo status para incluir los nuevos estados
ALTER TABLE public.operations 
DROP CONSTRAINT IF EXISTS operations_status_check;

ALTER TABLE public.operations 
ADD CONSTRAINT operations_status_check 
CHECK (status IN ('available', 'pending_review', 'approved', 'rejected', 'in_process', 'sold', 'withdrawn'));

-- Opcional: Si quieres cambiar el estado por defecto para nuevas operaciones creadas por usuarios
-- ALTER TABLE public.operations ALTER COLUMN status SET DEFAULT 'pending_review';
