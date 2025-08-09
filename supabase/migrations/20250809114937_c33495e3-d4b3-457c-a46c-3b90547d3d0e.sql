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