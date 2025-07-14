-- Eliminar la restricción check existente
ALTER TABLE public.contacts DROP CONSTRAINT contacts_lifecycle_stage_check;

-- Convertir contactos que son leads a customer
UPDATE public.contacts 
SET lifecycle_stage = 'customer'
WHERE lifecycle_stage = 'lead';

-- Cambiar companies con lifecycle_stage='lead' a 'customer'  
UPDATE public.companies
SET lifecycle_stage = 'customer'
WHERE lifecycle_stage = 'lead';

-- Crear el nuevo enum sin 'lead'
ALTER TYPE lifecycle_stage RENAME TO lifecycle_stage_old;

CREATE TYPE lifecycle_stage AS ENUM ('marketing_qualified_lead', 'sales_qualified_lead', 'opportunity', 'customer', 'evangelist');

-- Actualizar la tabla contacts
ALTER TABLE public.contacts 
  ALTER COLUMN lifecycle_stage DROP DEFAULT,
  ALTER COLUMN lifecycle_stage TYPE lifecycle_stage USING 
    CASE 
      WHEN lifecycle_stage_old::text = 'lead' THEN 'customer'::lifecycle_stage
      WHEN lifecycle_stage_old::text = 'cliente' THEN 'customer'::lifecycle_stage
      WHEN lifecycle_stage_old::text = 'suscriptor' THEN 'marketing_qualified_lead'::lifecycle_stage
      WHEN lifecycle_stage_old::text = 'proveedor' THEN 'opportunity'::lifecycle_stage
      ELSE 'customer'::lifecycle_stage
    END,
  ALTER COLUMN lifecycle_stage SET DEFAULT 'customer'::lifecycle_stage;

-- Actualizar la tabla companies  
ALTER TABLE public.companies
  ALTER COLUMN lifecycle_stage DROP DEFAULT,
  ALTER COLUMN lifecycle_stage TYPE lifecycle_stage USING 
    CASE 
      WHEN lifecycle_stage_old::text = 'lead' THEN 'customer'::lifecycle_stage
      ELSE lifecycle_stage_old::text::lifecycle_stage
    END,
  ALTER COLUMN lifecycle_stage SET DEFAULT 'customer'::lifecycle_stage;

-- Limpiar el tipo viejo
DROP TYPE lifecycle_stage_old;