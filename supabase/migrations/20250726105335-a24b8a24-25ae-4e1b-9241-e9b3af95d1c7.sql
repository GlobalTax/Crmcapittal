-- Phase 1: Database Structure for Reconversions Restructure
-- This is a critical migration that creates new structure while preserving existing data

-- Step 1: Create new enum types
CREATE TYPE public.reconversion_estado_type AS ENUM (
  'activa',
  'matching', 
  'negociando',
  'cerrada',
  'cancelada'
);

CREATE TYPE public.reconversion_subfase_type AS ENUM (
  'prospecting',
  'nda',
  'loi', 
  'dd',
  'signing',
  'closed'
);

CREATE TYPE public.reconversion_prioridad_type AS ENUM (
  'baja',
  'media',
  'alta',
  'critica'
);

-- Step 2: Create new main reconversiones table with proper FK structure
CREATE TABLE public.reconversiones_new (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comprador_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  contacto_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  mandato_origen_id UUID REFERENCES public.buying_mandates(id) ON DELETE SET NULL,
  estado reconversion_estado_type NOT NULL DEFAULT 'activa',
  subfase reconversion_subfase_type NOT NULL DEFAULT 'prospecting',
  prioridad reconversion_prioridad_type NOT NULL DEFAULT 'media',
  motive TEXT,
  pipeline_owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  fecha_objetivo_cierre DATE,
  ticket_min NUMERIC,
  ticket_max NUMERIC,
  porcentaje_objetivo NUMERIC,
  estrategia TEXT,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Keep legacy fields for migration compatibility
  company_name TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  rejection_reason TEXT,
  target_sectors TEXT[],
  investment_capacity_min NUMERIC,
  investment_capacity_max NUMERIC,
  geographic_preferences TEXT[],
  business_model_preferences TEXT[],
  notes TEXT,
  original_lead_id UUID,
  original_mandate_id UUID
);

-- Step 3: Create supporting tables

-- Preferences table for key-value configuration
CREATE TABLE public.reconversion_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reconversion_id UUID NOT NULL REFERENCES public.reconversiones_new(id) ON DELETE CASCADE,
  clave TEXT NOT NULL,
  valor TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reconversion_id, clave)
);

-- Matches table for tracking potential targets
CREATE TABLE public.reconversion_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reconversion_id UUID NOT NULL REFERENCES public.reconversiones_new(id) ON DELETE CASCADE,
  target_id UUID, -- Will reference mandate_targets when that table exists
  score NUMERIC,
  etapa_match TEXT,
  enviado_al_comprador BOOLEAN NOT NULL DEFAULT false,
  fecha_envio TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Approvals table for workflow management
CREATE TABLE public.reconversion_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reconversion_id UUID NOT NULL REFERENCES public.reconversiones_new(id) ON DELETE CASCADE,
  etapa TEXT NOT NULL,
  aprobado BOOLEAN,
  aprobado_por_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  comentario TEXT,
  aprobado_en TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 4: Enable RLS on new tables
ALTER TABLE public.reconversiones_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconversion_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconversion_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconversion_approvals ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for new tables

-- Reconversiones main table policies
CREATE POLICY "Users can view reconversiones they created or are assigned to"
ON public.reconversiones_new FOR SELECT
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR 
  auth.uid() = pipeline_owner_id OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can create reconversiones"
ON public.reconversiones_new FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update reconversiones they own or are assigned to"
ON public.reconversiones_new FOR UPDATE
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR 
  auth.uid() = pipeline_owner_id OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admin users can delete reconversiones"
ON public.reconversiones_new FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Preferences table policies
CREATE POLICY "Users can manage preferences for accessible reconversiones"
ON public.reconversion_preferences FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.reconversiones_new r
    WHERE r.id = reconversion_preferences.reconversion_id
    AND (
      auth.uid() = r.created_by OR 
      auth.uid() = r.assigned_to OR 
      auth.uid() = r.pipeline_owner_id OR
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      )
    )
  )
);

-- Matches table policies  
CREATE POLICY "Users can manage matches for accessible reconversiones"
ON public.reconversion_matches FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.reconversiones_new r
    WHERE r.id = reconversion_matches.reconversion_id
    AND (
      auth.uid() = r.created_by OR 
      auth.uid() = r.assigned_to OR 
      auth.uid() = r.pipeline_owner_id OR
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      )
    )
  )
);

-- Approvals table policies
CREATE POLICY "Users can manage approvals for accessible reconversiones"
ON public.reconversion_approvals FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.reconversiones_new r
    WHERE r.id = reconversion_approvals.reconversion_id
    AND (
      auth.uid() = r.created_by OR 
      auth.uid() = r.assigned_to OR 
      auth.uid() = r.pipeline_owner_id OR
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      )
    )
  )
);

-- Step 6: Create KPI view
CREATE VIEW public.vw_reconversion_kpi AS
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE estado = 'activa') as activas,
  COUNT(*) FILTER (WHERE estado = 'matching') as matching,
  COUNT(*) FILTER (WHERE estado = 'negociando') as negociando,
  COUNT(*) FILTER (WHERE estado = 'cerrada') as cerradas,
  COUNT(*) FILTER (WHERE prioridad IN ('alta', 'critica')) as urgentes,
  COUNT(*) FILTER (WHERE estado = 'cancelada') as canceladas
FROM public.reconversiones_new;

-- Step 7: Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_reconversion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reconversiones_new_updated_at
  BEFORE UPDATE ON public.reconversiones_new
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reconversion_updated_at();

CREATE TRIGGER update_reconversion_preferences_updated_at
  BEFORE UPDATE ON public.reconversion_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reconversion_updated_at();

CREATE TRIGGER update_reconversion_matches_updated_at
  BEFORE UPDATE ON public.reconversion_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reconversion_updated_at();