-- Create table for lead emails with open tracking
CREATE TABLE IF NOT EXISTS public.lead_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | sent | failed
  sent_at TIMESTAMPTZ,
  provider_message_id TEXT,
  tracking_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  open_count INTEGER NOT NULL DEFAULT 0,
  last_open_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_emails ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lead_emails_lead_id ON public.lead_emails(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_emails_created_by ON public.lead_emails(created_by);
CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_emails_tracking_id ON public.lead_emails(tracking_id);

-- Trigger to keep updated_at fresh
DROP TRIGGER IF EXISTS trg_lead_emails_updated_at ON public.lead_emails;
CREATE TRIGGER trg_lead_emails_updated_at
BEFORE UPDATE ON public.lead_emails
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Policies
DROP POLICY IF EXISTS lead_emails_select ON public.lead_emails;
CREATE POLICY lead_emails_select
ON public.lead_emails
FOR SELECT
USING (
  created_by = auth.uid()
  OR has_role_secure(auth.uid(), 'admin'::app_role)
  OR has_role_secure(auth.uid(), 'superadmin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = lead_emails.lead_id
      AND (l.assigned_to_id = auth.uid() OR l.created_by = auth.uid())
  )
);

DROP POLICY IF EXISTS lead_emails_insert ON public.lead_emails;
CREATE POLICY lead_emails_insert
ON public.lead_emails
FOR INSERT
WITH CHECK (
  created_by = auth.uid()
);

DROP POLICY IF EXISTS lead_emails_update ON public.lead_emails;
CREATE POLICY lead_emails_update
ON public.lead_emails
FOR UPDATE
USING (
  created_by = auth.uid() OR has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
)
WITH CHECK (
  created_by = auth.uid() OR has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

DROP POLICY IF EXISTS lead_emails_delete ON public.lead_emails;
CREATE POLICY lead_emails_delete
ON public.lead_emails
FOR DELETE
USING (
  created_by = auth.uid() OR has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);
