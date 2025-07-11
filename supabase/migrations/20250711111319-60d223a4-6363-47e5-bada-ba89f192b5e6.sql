-- Add missing fields to leads table to match Lead.ts interface
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS job_title text,
ADD COLUMN IF NOT EXISTS priority text CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
ADD COLUMN IF NOT EXISTS quality text CHECK (quality IN ('POOR', 'FAIR', 'GOOD', 'EXCELLENT')),
ADD COLUMN IF NOT EXISTS lead_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_follow_up_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_quality ON public.leads(quality);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON public.leads(next_follow_up_date);
CREATE INDEX IF NOT EXISTS idx_leads_tags ON public.leads USING GIN(tags);