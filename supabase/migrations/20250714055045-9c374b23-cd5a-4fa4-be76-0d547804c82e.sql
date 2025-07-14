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
  CASE 
    WHEN c.lead_source = 'website_form' THEN 'WEBSITE_FORM'::lead_source
    WHEN c.lead_source = 'capittal_market' THEN 'CAPITAL_MARKET'::lead_source
    WHEN c.lead_source = 'referral' THEN 'REFERRAL'::lead_source
    WHEN c.lead_source = 'email_campaign' THEN 'EMAIL_CAMPAIGN'::lead_source
    WHEN c.lead_source = 'social_media' THEN 'SOCIAL_MEDIA'::lead_source
    WHEN c.lead_source = 'cold_outreach' THEN 'COLD_OUTREACH'::lead_source
    WHEN c.lead_source = 'event' THEN 'EVENT'::lead_source
    ELSE 'OTHER'::lead_source
  END as source,
  CASE 
    WHEN c.lead_status = 'NEW' THEN 'NEW'::lead_status
    WHEN c.lead_status = 'CONTACTED' THEN 'CONTACTED'::lead_status
    WHEN c.lead_status = 'QUALIFIED' THEN 'QUALIFIED'::lead_status
    WHEN c.lead_status = 'DISQUALIFIED' THEN 'DISQUALIFIED'::lead_status
    ELSE 'NEW'::lead_status
  END as status,
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