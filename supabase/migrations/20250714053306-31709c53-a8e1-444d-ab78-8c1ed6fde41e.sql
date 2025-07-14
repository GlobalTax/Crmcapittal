-- Migrar contactos que son leads a la tabla leads dedicada
-- Primero, insertar en tabla leads los contactos con lifecycle_stage='lead'
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
  first_contact_date,
  last_contact_date,
  last_activity_date,
  next_follow_up_date,
  follow_up_count,
  email_opens,
  email_clicks,
  website_visits,
  content_downloads,
  tags,
  conversion_date,
  conversion_value,
  external_id,
  external_source,
  lead_origin
)
SELECT DISTINCT
  c.name,
  c.email,
  c.phone,
  c.company,
  c.position,
  COALESCE(c.lead_source, 'other'::lead_source) as source,
  COALESCE(c.lead_status, 'NEW'::lead_status) as status,
  CASE 
    WHEN c.lead_priority = 'low' THEN 'LOW'::lead_priority
    WHEN c.lead_priority = 'medium' THEN 'MEDIUM'::lead_priority  
    WHEN c.lead_priority = 'high' THEN 'HIGH'::lead_priority
    WHEN c.lead_priority = 'urgent' THEN 'URGENT'::lead_priority
    ELSE 'MEDIUM'::lead_priority
  END as priority,
  CASE 
    WHEN c.lead_quality = 'poor' THEN 'POOR'::lead_quality
    WHEN c.lead_quality = 'fair' THEN 'FAIR'::lead_quality
    WHEN c.lead_quality = 'good' THEN 'GOOD'::lead_quality
    WHEN c.lead_quality = 'excellent' THEN 'EXCELLENT'::lead_quality
    ELSE 'FAIR'::lead_quality
  END as quality,
  COALESCE(c.lead_score, 0),
  c.assigned_to_id,
  c.created_at,
  c.updated_at,
  c.first_contact_date,
  c.last_contact_date,
  c.last_activity_date,
  c.next_follow_up_date,
  c.follow_up_count,
  c.email_opens,
  c.email_clicks,
  c.website_visits,
  c.content_downloads,
  c.tags_array,
  c.conversion_date,
  c.conversion_value,
  c.external_id,
  c.external_source,
  CASE 
    WHEN c.lead_origin = 'manual' THEN 'manual'::lead_origin
    WHEN c.lead_origin = 'webform' THEN 'webform'::lead_origin
    WHEN c.lead_origin = 'import' THEN 'import'::lead_origin
    ELSE 'manual'::lead_origin
  END as lead_origin
FROM public.contacts c
WHERE c.lifecycle_stage = 'lead'
  AND c.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.leads l 
    WHERE l.email = c.email 
    AND l.name = c.name
  );

-- Ahora eliminar los contactos que eran leads (mantener solo contactos reales)
DELETE FROM public.contacts 
WHERE lifecycle_stage = 'lead';

-- Actualizar el enum lifecycle_stage para remover 'lead'
ALTER TYPE lifecycle_stage RENAME TO lifecycle_stage_old;

CREATE TYPE lifecycle_stage AS ENUM ('cliente', 'suscriptor', 'proveedor');

-- Actualizar columnas para usar el nuevo enum
ALTER TABLE public.contacts 
  ALTER COLUMN lifecycle_stage DROP DEFAULT,
  ALTER COLUMN lifecycle_stage TYPE lifecycle_stage USING lifecycle_stage::text::lifecycle_stage,
  ALTER COLUMN lifecycle_stage SET DEFAULT 'cliente'::lifecycle_stage;

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