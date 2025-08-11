-- Add processing control columns to inbound leads
ALTER TABLE public.crm_inbound_leads
  ADD COLUMN IF NOT EXISTS processing_status text NOT NULL DEFAULT 'received',
  ADD COLUMN IF NOT EXISTS processed_at timestamptz,
  ADD COLUMN IF NOT EXISTS processing_error text,
  ADD COLUMN IF NOT EXISTS company_id uuid,
  ADD COLUMN IF NOT EXISTS contact_id uuid,
  ADD COLUMN IF NOT EXISTS lead_id uuid,
  ADD COLUMN IF NOT EXISTS dedupe_key text;

-- Helpful index for deduplication lookups
CREATE INDEX IF NOT EXISTS idx_crm_inbound_leads_dedupe_key ON public.crm_inbound_leads (dedupe_key);
