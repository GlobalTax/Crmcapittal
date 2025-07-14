-- Migrar contactos que son leads a la tabla leads dedicada
INSERT INTO public.leads (
  name,
  email,
  phone,
  company_name,
  job_title,
  source,
  status,
  priority,
  quality,
  lead_score,
  assigned_to_id,
  created_at,
  updated_at,
  next_follow_up_date,
  tags,
  conversion_date,
  company_id
)
SELECT DISTINCT
  c.name,
  c.email,
  c.phone,
  c.company,
  c.position,
  COALESCE(c.lead_source, 'other')::lead_source as source,
  COALESCE(c.lead_status, 'NEW')::lead_status as status,
  c.lead_priority,
  c.lead_quality,
  COALESCE(c.lead_score, 0),
  c.assigned_to_id,
  c.created_at,
  c.updated_at,
  c.next_follow_up_date,
  c.tags_array,
  c.conversion_date,
  c.company_id
FROM public.contacts c
WHERE c.lifecycle_stage = 'lead'
  AND c.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.leads l 
    WHERE l.email = c.email 
    AND l.name = c.name
  );

-- Eliminar los contactos que eran leads
DELETE FROM public.contacts 
WHERE lifecycle_stage = 'lead';

-- Actualizar el enum lifecycle_stage para remover 'lead'
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
  ALTER COLUMN lifecycle_stage TYPE lifecycle_stage USING 
    CASE 
      WHEN lifecycle_stage::text = 'lead' THEN 'cliente'::lifecycle_stage
      ELSE lifecycle_stage::text::lifecycle_stage
    END,
  ALTER COLUMN lifecycle_stage SET DEFAULT 'cliente'::lifecycle_stage;

-- Limpiar el tipo viejo
DROP TYPE lifecycle_stage_old;