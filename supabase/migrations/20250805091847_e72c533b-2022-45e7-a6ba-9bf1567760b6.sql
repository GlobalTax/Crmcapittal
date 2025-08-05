-- Corregir la referencia de transaction_id en la tabla teasers para que apunte a operations
-- Primero, eliminar la foreign key constraint actual si existe
ALTER TABLE public.teasers 
DROP CONSTRAINT IF EXISTS teasers_transaction_id_fkey;

-- Crear nueva foreign key que referencia la tabla operations
ALTER TABLE public.teasers 
ADD CONSTRAINT teasers_transaction_id_fkey 
FOREIGN KEY (transaction_id) REFERENCES public.operations(id) ON DELETE CASCADE;