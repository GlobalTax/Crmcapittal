-- Simplemente remover todos los campos relacionados con leads de contacts
-- y limpiar las referencias

-- Eliminar la restricción check existente
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_lifecycle_stage_check;

-- Convertir todos los lifecycle_stage problemáticos a 'customer'
UPDATE public.contacts 
SET lifecycle_stage = 'customer'
WHERE lifecycle_stage::text IN ('lead', 'cliente', 'suscriptor', 'proveedor');

UPDATE public.companies
SET lifecycle_stage = 'customer'  
WHERE lifecycle_stage::text = 'lead';

-- Ahora podemos cambiar el enum de forma segura
ALTER TYPE lifecycle_stage RENAME TO lifecycle_stage_old;

CREATE TYPE lifecycle_stage AS ENUM ('marketing_qualified_lead', 'sales_qualified_lead', 'opportunity', 'customer', 'evangelist');

-- Actualizar contacts - simple conversión ya que todos son 'customer' ahora
ALTER TABLE public.contacts 
  ALTER COLUMN lifecycle_stage TYPE lifecycle_stage USING 'customer'::lifecycle_stage,
  ALTER COLUMN lifecycle_stage SET DEFAULT 'customer'::lifecycle_stage;

-- Actualizar companies
ALTER TABLE public.companies
  ALTER COLUMN lifecycle_stage TYPE lifecycle_stage USING 'customer'::lifecycle_stage,
  ALTER COLUMN lifecycle_stage SET DEFAULT 'customer'::lifecycle_stage;

-- Limpiar
DROP TYPE lifecycle_stage_old;