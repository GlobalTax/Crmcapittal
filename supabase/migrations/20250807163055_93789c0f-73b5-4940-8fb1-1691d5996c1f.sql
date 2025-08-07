-- ===== FASE A: COLABORADORES AVANZADO =====

-- 1. Performance Tracking para Colaboradores
CREATE TABLE public.collaborator_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID REFERENCES public.collaborators(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue NUMERIC DEFAULT 0,
  deals_closed INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  performance_score INTEGER DEFAULT 0,
  ranking_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Commission Management Avanzado
CREATE TABLE public.commission_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID REFERENCES public.collaborators(id) ON DELETE CASCADE,
  deal_id UUID,
  calculation_type TEXT NOT NULL DEFAULT 'percentage',
  base_amount NUMERIC NOT NULL,
  commission_rate NUMERIC NOT NULL,
  calculated_amount NUMERIC NOT NULL,
  calculation_details JSONB DEFAULT '{}',
  status TEXT DEFAULT 'calculated' CHECK (status IN ('calculated', 'approved', 'disputed', 'paid')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.commission_escrow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id UUID REFERENCES public.commission_calculations(id) ON DELETE CASCADE,
  escrow_amount NUMERIC NOT NULL,
  release_conditions JSONB DEFAULT '{}',
  hold_reason TEXT,
  expected_release_date DATE,
  status TEXT DEFAULT 'held' CHECK (status IN ('held', 'released', 'disputed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Territory Management
CREATE TABLE public.territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  territory_type TEXT NOT NULL CHECK (territory_type IN ('geographic', 'sector', 'account')),
  boundaries JSONB DEFAULT '{}',
  exclusivity_level TEXT DEFAULT 'shared' CHECK (exclusivity_level IN ('exclusive', 'shared', 'collaborative')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.collaborator_territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID REFERENCES public.collaborators(id) ON DELETE CASCADE,
  territory_id UUID REFERENCES public.territories(id) ON DELETE CASCADE,
  assignment_type TEXT DEFAULT 'primary' CHECK (assignment_type IN ('primary', 'secondary', 'support')),
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(collaborator_id, territory_id)
);