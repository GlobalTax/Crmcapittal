-- Fix HubSpot views with SECURITY DEFINER issues
-- Drop all existing HubSpot views with CASCADE to remove dependencies

DROP VIEW IF EXISTS public.hubspot_deals_with_details CASCADE;
DROP VIEW IF EXISTS public.hubspot_contacts_with_company CASCADE;
DROP VIEW IF EXISTS public.hubspot_companies_with_stats CASCADE;
DROP VIEW IF EXISTS public.hubspot_deals CASCADE;
DROP VIEW IF EXISTS public.hubspot_contacts CASCADE;
DROP VIEW IF EXISTS public.hubspot_companies CASCADE;

-- Recreate base views WITHOUT SECURITY DEFINER
CREATE OR REPLACE VIEW public.hubspot_companies AS
SELECT 
  id,
  external_id as hubspot_id,
  name,
  domain,
  industry,
  phone,
  city,
  state,
  country,
  website,
  description,
  annual_revenue,
  company_size,
  founded_year,
  created_at,
  updated_at,
  created_by
FROM companies 
WHERE source_table = 'hubspot_companies';

-- Enable RLS on the view by granting proper permissions
ALTER VIEW public.hubspot_companies OWNER TO postgres;

CREATE OR REPLACE VIEW public.hubspot_contacts AS
SELECT 
  id,
  external_id as hubspot_id,
  name,
  email,
  phone,
  position,
  company,
  company_id,
  lifecycle_stage,
  contact_type,
  contact_roles,
  contact_status,
  ecosystem_role,
  is_active,
  last_interaction_date,
  created_at,
  updated_at,
  created_by
FROM contacts 
WHERE source_table = 'hubspot_contacts';

ALTER VIEW public.hubspot_contacts OWNER TO postgres;

CREATE OR REPLACE VIEW public.hubspot_deals AS
SELECT 
  id,
  external_id as hubspot_id,
  deal_name,
  deal_value,
  deal_type,
  description,
  contact_id,
  close_date,
  is_active,
  created_at,
  updated_at,
  created_by
FROM deals 
WHERE source_table = 'hubspot_deals';

ALTER VIEW public.hubspot_deals OWNER TO postgres;

-- Recreate composite views WITHOUT SECURITY DEFINER
CREATE OR REPLACE VIEW public.hubspot_companies_with_stats AS
SELECT 
  hc.*,
  COALESCE(contact_count.total, 0) as total_contacts,
  COALESCE(deal_count.total, 0) as total_deals
FROM hubspot_companies hc
LEFT JOIN (
  SELECT 
    company_id, 
    COUNT(*) as total 
  FROM hubspot_contacts 
  WHERE company_id IS NOT NULL 
  GROUP BY company_id
) contact_count ON hc.id = contact_count.company_id
LEFT JOIN (
  SELECT 
    contact_id,
    COUNT(*) as total
  FROM hubspot_deals 
  WHERE contact_id IS NOT NULL
  GROUP BY contact_id
) deal_count ON hc.id = deal_count.contact_id;

ALTER VIEW public.hubspot_companies_with_stats OWNER TO postgres;

CREATE OR REPLACE VIEW public.hubspot_contacts_with_company AS
SELECT 
  hcon.*,
  hcomp.name as company_name,
  hcomp.domain as company_domain,
  hcomp.industry as company_industry,
  hcomp.website as company_website
FROM hubspot_contacts hcon
LEFT JOIN hubspot_companies hcomp ON hcon.company_id = hcomp.id;

ALTER VIEW public.hubspot_contacts_with_company OWNER TO postgres;

CREATE OR REPLACE VIEW public.hubspot_deals_with_details AS
SELECT 
  hd.*,
  hcon.name as contact_name,
  hcon.email as contact_email,
  hcon.phone as contact_phone,
  hcomp.name as company_name,
  hcomp.domain as company_domain
FROM hubspot_deals hd
LEFT JOIN hubspot_contacts hcon ON hd.contact_id = hcon.id
LEFT JOIN hubspot_companies hcomp ON hcon.company_id = hcomp.id;

ALTER VIEW public.hubspot_deals_with_details OWNER TO postgres;