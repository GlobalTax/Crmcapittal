-- Paso 1: Eliminar foreign key problemática si existe
ALTER TABLE public.teasers DROP CONSTRAINT IF EXISTS teasers_transaction_id_fkey;

-- Paso 2: Corregir valores por defecto para que coincidan con el código
ALTER TABLE public.teasers 
ALTER COLUMN teaser_type SET DEFAULT 'venta';

ALTER TABLE public.teasers 
ALTER COLUMN status SET DEFAULT 'borrador';

-- Paso 3: Actualizar registros existentes con valores inconsistentes
UPDATE public.teasers 
SET teaser_type = 'venta' 
WHERE teaser_type = 'blind';

UPDATE public.teasers 
SET status = 'borrador' 
WHERE status = 'draft';

-- Paso 4: Limpiar teasers huérfanos que referencian IDs inexistentes
DELETE FROM public.teasers 
WHERE transaction_id NOT IN (SELECT id FROM public.operations);

-- Paso 5: Recrear foreign key correctamente hacia operations
ALTER TABLE public.teasers 
ADD CONSTRAINT teasers_transaction_id_fkey 
FOREIGN KEY (transaction_id) REFERENCES public.operations(id) 
ON DELETE CASCADE;

-- Paso 6: Eliminar tabla transactions vacía para evitar confusión
DROP TABLE IF EXISTS public.transactions CASCADE;