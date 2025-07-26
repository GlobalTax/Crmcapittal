-- Crear tipos enum faltantes para reconversiones
CREATE TYPE IF NOT EXISTS public.reconversion_subfase AS ENUM (
  'prospecting',
  'nda',
  'loi', 
  'dd',
  'signing'
);

CREATE TYPE IF NOT EXISTS public.task_type AS ENUM (
  'validation',
  'document',
  'review',
  'closing',
  'finance',
  'communication',
  'research',
  'follow_up'
);

CREATE TYPE IF NOT EXISTS public.approval_type AS ENUM (
  'loi',
  'contract',
  'final_terms',
  'closing'
);

CREATE TYPE IF NOT EXISTS public.approval_stage AS ENUM (
  'loi',
  'preliminary',
  'final',
  'closing'
);

-- Actualizar tabla reconversiones_new para incluir subfase
ALTER TABLE public.reconversiones_new 
ADD COLUMN IF NOT EXISTS subfase reconversion_subfase DEFAULT 'prospecting',
ADD COLUMN IF NOT EXISTS matched_targets_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS matched_targets_data JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_matching_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fecha_objetivo_cierre DATE,
ADD COLUMN IF NOT EXISTS fecha_cierre TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS enterprise_value NUMERIC,
ADD COLUMN IF NOT EXISTS equity_percentage NUMERIC;