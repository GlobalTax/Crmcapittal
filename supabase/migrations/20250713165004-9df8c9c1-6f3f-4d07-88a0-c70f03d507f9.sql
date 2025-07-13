-- Migration to unify leads and contacts
-- Step 1: Add lead-specific fields to contacts table
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lead_source TEXT,
ADD COLUMN IF NOT EXISTS lead_status TEXT,
ADD COLUMN IF NOT EXISTS lead_priority TEXT,
ADD COLUMN IF NOT EXISTS lead_quality TEXT,
ADD COLUMN IF NOT EXISTS assigned_to_id UUID,
ADD COLUMN IF NOT EXISTS form_data JSONB DEFAULT '{}',
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
ADD COLUMN IF NOT EXISTS external_source TEXT;

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
  form_data,
  first_contact_date,
  last_contact_date,
  last_activity_date,
  next_follow_up_date,
  follow_up_count,
  email_opens,
  email_clicks,
  website_visits,
  content_downloads,
  tags_array,
  conversion_date,
  conversion_value,
  external_lead_id,
  external_source
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
  l.form_data,
  l.first_contact_date,
  l.last_contact_date,
  l.last_activity_date,
  l.next_follow_up_date,
  l.follow_up_count,
  l.email_opens,
  l.email_clicks,
  l.website_visits,
  l.content_downloads,
  l.tags,
  l.conversion_date,
  l.conversion_value,
  l.external_id,
  l.external_source
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
  form_data = COALESCE(leads.form_data, contacts.form_data, '{}'),
  first_contact_date = COALESCE(leads.first_contact_date, contacts.first_contact_date),
  last_contact_date = COALESCE(leads.last_contact_date, contacts.last_contact_date),
  last_activity_date = COALESCE(leads.last_activity_date, contacts.last_activity_date),
  next_follow_up_date = COALESCE(leads.next_follow_up_date, contacts.next_follow_up_date),
  follow_up_count = COALESCE(leads.follow_up_count, contacts.follow_up_count, 0),
  email_opens = COALESCE(leads.email_opens, contacts.email_opens, 0),
  email_clicks = COALESCE(leads.email_clicks, contacts.email_clicks, 0),
  website_visits = COALESCE(leads.website_visits, contacts.website_visits, 0),
  content_downloads = COALESCE(leads.content_downloads, contacts.content_downloads, 0),
  tags_array = COALESCE(leads.tags, contacts.tags_array, '{}'),
  conversion_date = COALESCE(leads.conversion_date, contacts.conversion_date),
  conversion_value = COALESCE(leads.conversion_value, contacts.conversion_value),
  external_lead_id = COALESCE(leads.external_id, contacts.external_lead_id),
  external_source = COALESCE(leads.external_source, contacts.external_source),
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

-- Step 5: Update RLS policies for lead functionality
-- Add policy for users to see leads (contacts with lifecycle_stage = 'lead')
CREATE POLICY "Users can view leads" ON public.contacts
FOR SELECT USING (
  lifecycle_stage = 'lead' AND (
    created_by = auth.uid() OR 
    assigned_to_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  )
);

-- Note: We'll keep the leads table for now but it will be deprecated
-- In a future migration, we can drop it after confirming everything works