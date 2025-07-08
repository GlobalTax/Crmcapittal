-- Verificar y crear solo lo que falta para mandate_targets

-- Crear tabla mandate_targets si no existe
CREATE TABLE IF NOT EXISTS public.mandate_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mandate_id UUID NOT NULL REFERENCES public.buying_mandates(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  sector TEXT,
  location TEXT,
  revenues NUMERIC,
  ebitda NUMERIC,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  contacted BOOLEAN NOT NULL DEFAULT false,
  contact_date DATE,
  contact_method TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.mandate_targets ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen y recrear
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view mandate targets they created or from their mandates" ON public.mandate_targets;
  DROP POLICY IF EXISTS "Users can insert mandate targets" ON public.mandate_targets;
  DROP POLICY IF EXISTS "Users can update mandate targets they created" ON public.mandate_targets;
  DROP POLICY IF EXISTS "Admin users can delete mandate targets" ON public.mandate_targets;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Crear políticas RLS para mandate_targets
CREATE POLICY "Users can view mandate targets they created or from their mandates"
ON public.mandate_targets FOR SELECT
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.buying_mandates 
    WHERE id = mandate_targets.mandate_id 
    AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = ANY(ARRAY['admin'::app_role, 'superadmin'::app_role])
    ))
  )
);

CREATE POLICY "Users can insert mandate targets"
ON public.mandate_targets FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.buying_mandates 
    WHERE id = mandate_targets.mandate_id 
    AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = ANY(ARRAY['admin'::app_role, 'superadmin'::app_role])
    ))
  )
);

CREATE POLICY "Users can update mandate targets they created"
ON public.mandate_targets FOR UPDATE
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.buying_mandates 
    WHERE id = mandate_targets.mandate_id 
    AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = ANY(ARRAY['admin'::app_role, 'superadmin'::app_role])
    ))
  )
);

CREATE POLICY "Admin users can delete mandate targets"
ON public.mandate_targets FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = ANY(ARRAY['admin'::app_role, 'superadmin'::app_role])
  )
);