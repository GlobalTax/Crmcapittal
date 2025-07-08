-- Verificar si existe la tabla mandate_targets y crear las tablas faltantes para mandates

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

-- Crear tabla user_table_preferences si no existe para arreglar error 406
CREATE TABLE IF NOT EXISTS public.user_table_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  column_preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, table_name)
);

-- Habilitar RLS para user_table_preferences
ALTER TABLE public.user_table_preferences ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para user_table_preferences
CREATE POLICY "Users can manage their own table preferences"
ON public.user_table_preferences FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Crear trigger para updated_at en mandate_targets
CREATE OR REPLACE FUNCTION public.update_mandate_target_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mandate_targets_updated_at
  BEFORE UPDATE ON public.mandate_targets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mandate_target_updated_at();

-- Crear trigger para updated_at en user_table_preferences
CREATE TRIGGER update_user_table_preferences_updated_at
  BEFORE UPDATE ON public.user_table_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();