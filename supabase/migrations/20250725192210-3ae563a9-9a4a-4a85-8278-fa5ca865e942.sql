-- 2.3 Métodos de valoración table
-- Stores different valuation methods and their results for each valoracion

CREATE TABLE IF NOT EXISTS public.valoracion_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  valoracion_id uuid NOT NULL REFERENCES public.valoraciones(id) ON DELETE CASCADE,
  metodo text NOT NULL CHECK (metodo IN ('dcf', 'multiples', 'mixto', 'otros')),
  resultado numeric,
  comentario text,
  confidence_level integer CHECK (confidence_level >= 1 AND confidence_level <= 10),
  calculation_date timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  
  -- Ensure unique method per valoracion
  UNIQUE(valoracion_id, metodo)
);

-- Add table and column comments
COMMENT ON TABLE public.valoracion_methods IS 'Stores different valuation methods and their results for each valoracion';
COMMENT ON COLUMN public.valoracion_methods.id IS 'Unique identifier for the valuation method';
COMMENT ON COLUMN public.valoracion_methods.valoracion_id IS 'Reference to the valoracion this method belongs to';
COMMENT ON COLUMN public.valoracion_methods.metodo IS 'Valuation method type: dcf, multiples, mixto, otros';
COMMENT ON COLUMN public.valoracion_methods.resultado IS 'Calculated result/value from this method';
COMMENT ON COLUMN public.valoracion_methods.comentario IS 'Additional comments or notes about this method';
COMMENT ON COLUMN public.valoracion_methods.confidence_level IS 'Confidence level in the result (1-10 scale)';
COMMENT ON COLUMN public.valoracion_methods.calculation_date IS 'When this method was calculated';
COMMENT ON COLUMN public.valoracion_methods.created_at IS 'When this record was created';
COMMENT ON COLUMN public.valoracion_methods.updated_at IS 'When this record was last updated';
COMMENT ON COLUMN public.valoracion_methods.created_by IS 'User who created this record';

-- Enable Row Level Security
ALTER TABLE public.valoracion_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can access valoracion methods if they have access to the valoracion
CREATE POLICY "Users can view valoracion methods for accessible valoraciones"
  ON public.valoracion_methods
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.valoraciones v
      WHERE v.id = valoracion_methods.valoracion_id
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

CREATE POLICY "Users can create valoracion methods for accessible valoraciones"
  ON public.valoracion_methods
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.valoraciones v
      WHERE v.id = valoracion_methods.valoracion_id
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

CREATE POLICY "Users can update valoracion methods for accessible valoraciones"
  ON public.valoracion_methods
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.valoraciones v
      WHERE v.id = valoracion_methods.valoracion_id
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

CREATE POLICY "Users can delete valoracion methods for accessible valoraciones"
  ON public.valoracion_methods
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.valoraciones v
      WHERE v.id = valoracion_methods.valoracion_id
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_valoracion_methods_valoracion_id ON public.valoracion_methods(valoracion_id);
CREATE INDEX IF NOT EXISTS idx_valoracion_methods_metodo ON public.valoracion_methods(metodo);
CREATE INDEX IF NOT EXISTS idx_valoracion_methods_created_by ON public.valoracion_methods(created_by);
CREATE INDEX IF NOT EXISTS idx_valoracion_methods_calculation_date ON public.valoracion_methods(calculation_date);

-- Create trigger for automatic updated_at timestamp
CREATE TRIGGER update_valoracion_methods_updated_at
  BEFORE UPDATE ON public.valoracion_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();