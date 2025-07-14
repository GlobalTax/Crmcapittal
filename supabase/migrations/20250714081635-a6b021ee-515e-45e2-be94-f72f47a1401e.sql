-- Eliminar el trigger que bloquea el cambio
DROP TRIGGER IF EXISTS on_lifecycle_stage_change ON public.contacts;

-- Paso 1: Eliminar defaults y constrains
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_lifecycle_stage_check;
ALTER TABLE public.contacts ALTER COLUMN lifecycle_stage DROP DEFAULT;
ALTER TABLE public.companies ALTER COLUMN lifecycle_stage DROP DEFAULT;

-- Paso 2: Convertir valores existentes
UPDATE public.contacts 
SET lifecycle_stage = 'customer'
WHERE lifecycle_stage::text IN ('lead', 'cliente', 'suscriptor', 'proveedor');

UPDATE public.companies
SET lifecycle_stage = 'customer'  
WHERE lifecycle_stage::text = 'lead';

-- Paso 3: Cambiar el enum
ALTER TYPE lifecycle_stage RENAME TO lifecycle_stage_old;
CREATE TYPE lifecycle_stage AS ENUM ('marketing_qualified_lead', 'sales_qualified_lead', 'opportunity', 'customer', 'evangelist');

-- Paso 4: Actualizar las tablas
ALTER TABLE public.contacts 
  ALTER COLUMN lifecycle_stage TYPE lifecycle_stage USING 'customer'::lifecycle_stage;

ALTER TABLE public.companies
  ALTER COLUMN lifecycle_stage TYPE lifecycle_stage USING 'customer'::lifecycle_stage;

-- Paso 5: Restaurar defaults
ALTER TABLE public.contacts ALTER COLUMN lifecycle_stage SET DEFAULT 'customer'::lifecycle_stage;
ALTER TABLE public.companies ALTER COLUMN lifecycle_stage SET DEFAULT 'customer'::lifecycle_stage;

-- Paso 6: Limpiar
DROP TYPE lifecycle_stage_old;