-- Completar tabla valoracion_inputs con estructura completa
CREATE TABLE IF NOT EXISTS public.valoracion_inputs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  valoracion_id uuid NOT NULL REFERENCES public.valoraciones(id) ON DELETE CASCADE,
  clave text NOT NULL,
  valor jsonb NOT NULL,
  tipo_dato text NOT NULL CHECK (tipo_dato IN ('texto', 'numero', 'fecha', 'booleano', 'lista', 'archivo')),
  obligatorio boolean NOT NULL DEFAULT false,
  descripcion text,
  orden_display integer DEFAULT 0,
  validacion_reglas jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  
  -- Evitar duplicados de clave por valoración
  UNIQUE(valoracion_id, clave)
);

-- Habilitar RLS
ALTER TABLE public.valoracion_inputs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para valoracion_inputs
CREATE POLICY "Users can view valoracion inputs they have access to"
ON public.valoracion_inputs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.valoraciones v
    WHERE v.id = valoracion_inputs.valoracion_id
    AND (
      v.assigned_to = auth.uid() OR
      v.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() 
        AND ur.role IN ('admin', 'superadmin')
      )
    )
  )
);

CREATE POLICY "Users can create valoracion inputs for their valoraciones"
ON public.valoracion_inputs FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.valoraciones v
    WHERE v.id = valoracion_inputs.valoracion_id
    AND (
      v.assigned_to = auth.uid() OR
      v.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() 
        AND ur.role IN ('admin', 'superadmin')
      )
    )
  )
);

CREATE POLICY "Users can update valoracion inputs they have access to"
ON public.valoracion_inputs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.valoraciones v
    WHERE v.id = valoracion_inputs.valoracion_id
    AND (
      v.assigned_to = auth.uid() OR
      v.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() 
        AND ur.role IN ('admin', 'superadmin')
      )
    )
  )
);

CREATE POLICY "Users can delete valoracion inputs they have access to"
ON public.valoracion_inputs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.valoraciones v
    WHERE v.id = valoracion_inputs.valoracion_id
    AND (
      v.assigned_to = auth.uid() OR
      v.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() 
        AND ur.role IN ('admin', 'superadmin')
      )
    )
  )
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_valoracion_inputs_valoracion_id ON public.valoracion_inputs(valoracion_id);
CREATE INDEX IF NOT EXISTS idx_valoracion_inputs_clave ON public.valoracion_inputs(clave);
CREATE INDEX IF NOT EXISTS idx_valoracion_inputs_tipo_dato ON public.valoracion_inputs(tipo_dato);
CREATE INDEX IF NOT EXISTS idx_valoracion_inputs_created_by ON public.valoracion_inputs(created_by);

-- Trigger para updated_at automático
CREATE TRIGGER update_valoracion_inputs_updated_at
  BEFORE UPDATE ON public.valoracion_inputs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Comentarios de documentación
COMMENT ON TABLE public.valoracion_inputs IS 'Inputs dinámicos configurables para valoraciones';
COMMENT ON COLUMN public.valoracion_inputs.clave IS 'Clave única del input dentro de la valoración';
COMMENT ON COLUMN public.valoracion_inputs.valor IS 'Valor del input en formato JSON flexible';
COMMENT ON COLUMN public.valoracion_inputs.tipo_dato IS 'Tipo de dato del input para validación';
COMMENT ON COLUMN public.valoracion_inputs.obligatorio IS 'Si el input es obligatorio para completar la valoración';
COMMENT ON COLUMN public.valoracion_inputs.validacion_reglas IS 'Reglas de validación personalizadas en JSON';

-- Añadir campos faltantes a valoraciones si no existen
ALTER TABLE public.valoraciones
ADD COLUMN IF NOT EXISTS valoracion_ev numeric,
ADD COLUMN IF NOT EXISTS valoracion_eqty numeric;

-- Comentarios para los nuevos campos
COMMENT ON COLUMN public.valoraciones.valoracion_ev IS 'Valoración por Enterprise Value';
COMMENT ON COLUMN public.valoraciones.valoracion_eqty IS 'Valoración por Equity Value';