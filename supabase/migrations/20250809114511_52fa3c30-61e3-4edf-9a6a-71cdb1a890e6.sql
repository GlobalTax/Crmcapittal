-- Crear tabla para matches entre mandatos y empresas
CREATE TABLE IF NOT EXISTS public.mandate_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  mandate_id UUID NOT NULL REFERENCES public.buying_mandates(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  match_details JSONB DEFAULT '{}',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'contacted', 'qualified', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, mandate_id)
);

-- Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_mandate_matches_company_id ON public.mandate_matches(company_id);
CREATE INDEX IF NOT EXISTS idx_mandate_matches_mandate_id ON public.mandate_matches(mandate_id);
CREATE INDEX IF NOT EXISTS idx_mandate_matches_score ON public.mandate_matches(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_mandate_matches_status ON public.mandate_matches(status);

-- Habilitar RLS
ALTER TABLE public.mandate_matches ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mandate_matches
CREATE POLICY "users_view_mandate_matches" ON public.mandate_matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.buying_mandates bm
      WHERE bm.id = mandate_matches.mandate_id
      AND (bm.created_by = auth.uid() OR bm.assigned_user_id = auth.uid())
    ) OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

CREATE POLICY "users_manage_mandate_matches" ON public.mandate_matches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.buying_mandates bm
      WHERE bm.id = mandate_matches.mandate_id
      AND (bm.created_by = auth.uid() OR bm.assigned_user_id = auth.uid())
    ) OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_mandate_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mandate_matches_updated_at
  BEFORE UPDATE ON public.mandate_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mandate_matches_updated_at();

-- Crear función para programar cron jobs
CREATE OR REPLACE FUNCTION public.schedule_crm_automations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Programar backfill nocturno (todos los días a las 2:00 AM)
  SELECT cron.schedule(
    'crm-backfill-nocturno',
    '0 2 * * *',
    $$
    SELECT net.http_post(
      url := 'https://nbvvdaprcecaqvvkqcto.supabase.co/functions/v1/crm-automation-backfill',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idnZkYXByY2VjYXF2dmtxY3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTQxMDEsImV4cCI6MjA2NTI5MDEwMX0.U-xmTVjSKNxSjCugemIdIqSLDuFEMt8BuvH0IifJAfo"}'::jsonb,
      body := '{"scheduled": true}'::jsonb
    );
    $$
  );

  -- Programar re-matching semanal (domingos a las 3:00 AM)
  SELECT cron.schedule(
    'crm-rematching-semanal',
    '0 3 * * 0',
    $$
    SELECT net.http_post(
      url := 'https://nbvvdaprcecaqvvkqcto.supabase.co/functions/v1/crm-rematching',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idnZkYXByY2VjYXF2dmtxY3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTQxMDEsImV4cCI6MjA2NTI5MDEwMX0.U-xmTVjSKNxSjCugemIdIqSLDuFEMt8BuvH0IifJAfo"}'::jsonb,
      body := '{"recalculate_all_matches": true}'::jsonb
    );
    $$
  );
END;
$$;

-- Ejecutar la programación de cron jobs
SELECT public.schedule_crm_automations();