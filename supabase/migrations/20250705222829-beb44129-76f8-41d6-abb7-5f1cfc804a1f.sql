-- Migración para cambiar "negocios" a "transacciones"
-- Paso 1: Crear la nueva tabla transacciones basada en negocios
CREATE TABLE public.transacciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_transaccion TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  contact_id UUID REFERENCES public.contacts(id),
  valor_transaccion BIGINT,
  moneda TEXT DEFAULT 'EUR',
  tipo_transaccion TEXT NOT NULL DEFAULT 'venta',
  stage_id UUID REFERENCES public.stages(id),
  prioridad TEXT DEFAULT 'media',
  propietario_transaccion TEXT,
  ebitda BIGINT,
  ingresos BIGINT,
  multiplicador NUMERIC,
  sector TEXT,
  ubicacion TEXT,
  empleados INTEGER,
  descripcion TEXT,
  fuente_lead TEXT,
  proxima_actividad TEXT,
  notas TEXT,
  fecha_cierre TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_transacciones_company_id ON public.transacciones(company_id);
CREATE INDEX idx_transacciones_contact_id ON public.transacciones(contact_id);
CREATE INDEX idx_transacciones_stage_id ON public.transacciones(stage_id);
CREATE INDEX idx_transacciones_created_by ON public.transacciones(created_by);
CREATE INDEX idx_transacciones_is_active ON public.transacciones(is_active);

-- Crear políticas RLS para transacciones
ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create transacciones" 
  ON public.transacciones 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view active transacciones" 
  ON public.transacciones 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Users can update their own transacciones" 
  ON public.transacciones 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own transacciones" 
  ON public.transacciones 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Migrar datos existentes de negocios a transacciones
INSERT INTO public.transacciones (
  nombre_transaccion, company_id, contact_id, valor_transaccion, moneda, tipo_transaccion,
  stage_id, prioridad, propietario_transaccion, ebitda, ingresos, multiplicador,
  sector, ubicacion, empleados, descripcion, fuente_lead, proxima_actividad,
  notas, fecha_cierre, is_active, created_by, created_at, updated_at
)
SELECT 
  nombre_negocio, 
  company_id,
  contact_id,
  valor_negocio,
  moneda,
  tipo_negocio,
  stage_id,
  prioridad,
  propietario_negocio,
  ebitda,
  ingresos,
  multiplicador,
  sector,
  ubicacion,
  empleados,
  descripcion,
  fuente_lead,
  proxima_actividad,
  notas,
  fecha_cierre,
  is_active,
  created_by,
  created_at,
  updated_at
FROM public.negocios
WHERE EXISTS (SELECT 1 FROM public.negocios LIMIT 1);

-- Agregar trigger para updated_at
CREATE TRIGGER update_transacciones_updated_at
  BEFORE UPDATE ON public.transacciones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();