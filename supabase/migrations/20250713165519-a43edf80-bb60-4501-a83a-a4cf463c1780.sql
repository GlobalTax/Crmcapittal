-- Migration to unify leads and contacts (corrected)
-- Step 1: Add lead-specific fields to contacts table
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lead_source TEXT,
ADD COLUMN IF NOT EXISTS lead_status TEXT,
ADD COLUMN IF NOT EXISTS lead_priority TEXT,
ADD COLUMN IF NOT EXISTS lead_quality TEXT,
ADD COLUMN IF NOT EXISTS assigned_to_id UUID,
ADD COLUMN IF NOT EXISTS first_contact_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_follow_up_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS follow_up_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS email_opens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS email_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS website_visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS content_downloads INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags_array TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS conversion_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS conversion_value NUMERIC,
ADD COLUMN IF NOT EXISTS external_lead_id TEXT,
ADD COLUMN IF NOT EXISTS external_source TEXT,
ADD COLUMN IF NOT EXISTS lead_origin TEXT,
ADD COLUMN IF NOT EXISTS lead_type TEXT,
ADD COLUMN IF NOT EXISTS stage_id UUID,
ADD COLUMN IF NOT EXISTS collaborator_id UUID,
ADD COLUMN IF NOT EXISTS converted_to_mandate_id UUID;

-- Step 2: Migrate all leads to contacts
INSERT INTO public.contacts (
  id,
  name,
  email,
  phone,
  company,
  company_id,
  position,
  contact_type,
  lifecycle_stage,
  contact_source,
  notes,
  created_at,
  updated_at,
  created_by,
  -- Lead-specific fields
  lead_score,
  lead_source,
  lead_status,
  lead_priority,
  lead_quality,
  assigned_to_id,
  first_contact_date,
  last_contact_date,
  last_activity_date,
  next_follow_up_date,
  tags_array,
  conversion_date,
  conversion_value,
  lead_origin,
  lead_type,
  stage_id,
  collaborator_id,
  converted_to_mandate_id
)
SELECT 
  l.id,
  l.name,
  l.email,
  l.phone,
  l.company_name,
  l.company_id,
  l.job_title,
  'lead'::text as contact_type,
  'lead'::text as lifecycle_stage,
  l.source::text as contact_source,
  l.message as notes,
  l.created_at,
  l.updated_at,
  NULL as created_by, -- leads don't have created_by, will be NULL
  -- Lead-specific fields
  l.lead_score,
  l.source::text as lead_source,
  l.status::text as lead_status,
  l.priority::text as lead_priority,
  l.quality::text as lead_quality,
  l.assigned_to_id,
  NULL as first_contact_date, -- not in leads table
  NULL as last_contact_date, -- not in leads table  
  NULL as last_activity_date, -- not in leads table
  l.next_follow_up_date,
  l.tags,
  l.conversion_date,
  NULL as conversion_value, -- not in leads table
  l.lead_origin,
  l.lead_type::text,
  l.stage_id,
  l.collaborator_id,
  l.converted_to_mandate_id
FROM public.leads l
WHERE NOT EXISTS (
  SELECT 1 FROM public.contacts c 
  WHERE c.email = l.email 
  AND c.email IS NOT NULL 
  AND l.email IS NOT NULL
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Update existing contacts that have matching emails with leads
UPDATE public.contacts 
SET 
  lifecycle_stage = 'lead',
  contact_type = 'lead',
  lead_score = COALESCE(leads.lead_score, contacts.lead_score, 0),
  lead_source = COALESCE(leads.source::text, contacts.lead_source),
  lead_status = COALESCE(leads.status::text, contacts.lead_status),
  lead_priority = COALESCE(leads.priority::text, contacts.lead_priority),
  lead_quality = COALESCE(leads.quality::text, contacts.lead_quality),
  assigned_to_id = COALESCE(leads.assigned_to_id, contacts.assigned_to_id),
  next_follow_up_date = COALESCE(leads.next_follow_up_date, contacts.next_follow_up_date),
  tags_array = COALESCE(leads.tags, contacts.tags_array, '{}'),
  conversion_date = COALESCE(leads.conversion_date, contacts.conversion_date),
  lead_origin = COALESCE(leads.lead_origin, contacts.lead_origin),
  lead_type = COALESCE(leads.lead_type::text, contacts.lead_type),
  stage_id = COALESCE(leads.stage_id, contacts.stage_id),
  collaborator_id = COALESCE(leads.collaborator_id, contacts.collaborator_id),
  converted_to_mandate_id = COALESCE(leads.converted_to_mandate_id, contacts.converted_to_mandate_id),
  updated_at = now()
FROM public.leads 
WHERE contacts.email = leads.email 
AND contacts.email IS NOT NULL 
AND leads.email IS NOT NULL;

-- Step 4: Create indexes for better performance on lead-related queries
CREATE INDEX IF NOT EXISTS idx_contacts_lifecycle_stage ON public.contacts(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_status ON public.contacts(lead_status);
CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to_id ON public.contacts(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_score ON public.contacts(lead_score);