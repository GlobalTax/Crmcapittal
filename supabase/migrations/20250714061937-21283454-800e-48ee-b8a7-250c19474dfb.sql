-- Simplemente separar los conceptos sin migrar datos existentes
-- Solo actualizar el enum lifecycle_stage para remover 'lead'

-- Primero cambiar todos los contacts con lifecycle_stage='lead' a 'cliente'
UPDATE public.contacts 
SET lifecycle_stage = 'cliente'
WHERE lifecycle_stage = 'lead';

-- Cambiar companies con lifecycle_stage='lead' a 'cliente'  
UPDATE public.companies
SET lifecycle_stage = 'cliente'
WHERE lifecycle_stage = 'lead';

-- Ahora actualizar el enum lifecycle_stage para remover 'lead'
ALTER TYPE lifecycle_stage RENAME TO lifecycle_stage_old;

CREATE TYPE lifecycle_stage AS ENUM ('cliente', 'suscriptor', 'proveedor');

-- Actualizar la tabla contacts
ALTER TABLE public.contacts 
  ALTER COLUMN lifecycle_stage DROP DEFAULT,
  ALTER COLUMN lifecycle_stage TYPE lifecycle_stage USING lifecycle_stage::text::lifecycle_stage,
  ALTER COLUMN lifecycle_stage SET DEFAULT 'cliente'::lifecycle_stage;

-- Actualizar la tabla companies  
ALTER TABLE public.companies
  ALTER COLUMN lifecycle_stage DROP DEFAULT,
  ALTER COLUMN lifecycle_stage TYPE lifecycle_stage USING lifecycle_stage::text::lifecycle_stage,
  ALTER COLUMN lifecycle_stage SET DEFAULT 'cliente'::lifecycle_stage;

-- Limpiar el tipo viejo
DROP TYPE lifecycle_stage_old;