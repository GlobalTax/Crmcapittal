
-- Asignar managers aleatorios a las operaciones existentes que no tienen manager asignado
UPDATE public.operations 
SET manager_id = (
  SELECT id FROM public.operation_managers 
  ORDER BY RANDOM() 
  LIMIT 1
)
WHERE manager_id IS NULL;

-- Asegurar que al menos una operación tenga cada manager
UPDATE public.operations 
SET manager_id = (SELECT id FROM public.operation_managers WHERE name = 'Samuel Lorente' LIMIT 1)
WHERE id = (SELECT id FROM public.operations LIMIT 1);

UPDATE public.operations 
SET manager_id = (SELECT id FROM public.operation_managers WHERE name = 'María García' LIMIT 1)
WHERE id = (SELECT id FROM public.operations OFFSET 1 LIMIT 1);

UPDATE public.operations 
SET manager_id = (SELECT id FROM public.operation_managers WHERE name = 'Carlos Ruiz' LIMIT 1)
WHERE id = (SELECT id FROM public.operations OFFSET 2 LIMIT 1);
