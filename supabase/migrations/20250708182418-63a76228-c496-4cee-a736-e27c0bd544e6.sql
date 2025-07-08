-- Arreglar políticas RLS para mandate_targets y verificar permisos

-- Primero, verificar si la tabla mandate_targets existe y tiene RLS habilitado
ALTER TABLE public.mandate_targets ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes que pueden estar causando problemas
DROP POLICY IF EXISTS "Users can view mandate targets they created or from their mandates" ON public.mandate_targets;
DROP POLICY IF EXISTS "Users can insert mandate targets" ON public.mandate_targets;
DROP POLICY IF EXISTS "Users can update mandate targets they created" ON public.mandate_targets;
DROP POLICY IF EXISTS "Admin users can delete mandate targets" ON public.mandate_targets;

-- Crear políticas más permisivas y claras
CREATE POLICY "Users can view mandate targets"
ON public.mandate_targets FOR SELECT
USING (
  -- Usuarios autenticados pueden ver targets de sus mandatos o si son admin
  auth.uid() IS NOT NULL AND (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.buying_mandates 
      WHERE id = mandate_targets.mandate_id 
      AND (
        created_by = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() 
          AND role = ANY(ARRAY['admin'::app_role, 'superadmin'::app_role])
        )
      )
    )
  )
);

CREATE POLICY "Users can insert mandate targets"
ON public.mandate_targets FOR INSERT
WITH CHECK (
  -- Usuario autenticado debe ser el creador y tener acceso al mandato
  auth.uid() IS NOT NULL AND
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.buying_mandates 
    WHERE id = mandate_targets.mandate_id 
    AND (
      created_by = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = ANY(ARRAY['admin'::app_role, 'superadmin'::app_role])
      )
    )
  )
);

CREATE POLICY "Users can update mandate targets"
ON public.mandate_targets FOR UPDATE
USING (
  -- Usuario autenticado puede actualizar targets que creó o si es admin
  auth.uid() IS NOT NULL AND (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.buying_mandates 
      WHERE id = mandate_targets.mandate_id 
      AND (
        created_by = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() 
          AND role = ANY(ARRAY['admin'::app_role, 'superadmin'::app_role])
        )
      )
    )
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

-- Verificar que user_table_preferences tiene la estructura correcta
-- Crear tabla si no existe con estructura correcta
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

-- Eliminar políticas existentes y recrear
DROP POLICY IF EXISTS "Users can manage their own table preferences" ON public.user_table_preferences;

-- Crear políticas más específicas para user_table_preferences
CREATE POLICY "Users can view their own table preferences"
ON public.user_table_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own table preferences"
ON public.user_table_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own table preferences"
ON public.user_table_preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own table preferences"
ON public.user_table_preferences FOR DELETE
USING (auth.uid() = user_id);