-- Crear tipos enum para reconversiones - método compatible
DO $$
BEGIN
  -- Crear reconversion_subfase
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reconversion_subfase') THEN
    CREATE TYPE public.reconversion_subfase AS ENUM (
      'prospecting',
      'nda',
      'loi', 
      'dd',
      'signing'
    );
  END IF;

  -- Crear task_type  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_type') THEN
    CREATE TYPE public.task_type AS ENUM (
      'validation',
      'document',
      'review',
      'closing',
      'finance',
      'communication',
      'research',
      'follow_up'
    );
  END IF;

  -- Crear approval_type
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_type') THEN
    CREATE TYPE public.approval_type AS ENUM (
      'loi',
      'contract',
      'final_terms',
      'closing'
    );
  END IF;

  -- Crear approval_stage
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_stage') THEN
    CREATE TYPE public.approval_stage AS ENUM (
      'loi',
      'preliminary',
      'final',
      'closing'
    );
  END IF;
END
$$;

-- Actualizar tabla reconversiones_new para incluir nuevas columnas
ALTER TABLE public.reconversiones_new 
ADD COLUMN IF NOT EXISTS subfase reconversion_subfase DEFAULT 'prospecting',
ADD COLUMN IF NOT EXISTS matched_targets_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS matched_targets_data JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_matching_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fecha_objetivo_cierre DATE,
ADD COLUMN IF NOT EXISTS fecha_cierre TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS enterprise_value NUMERIC,
ADD COLUMN IF NOT EXISTS equity_percentage NUMERIC;