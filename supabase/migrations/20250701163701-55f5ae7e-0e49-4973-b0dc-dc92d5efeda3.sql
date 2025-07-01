
-- Crear tabla negocios para reemplazar deals
CREATE TABLE public.negocios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_negocio TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  contact_id UUID REFERENCES public.contacts(id),
  valor_negocio BIGINT,
  moneda TEXT DEFAULT 'EUR',
  tipo_negocio TEXT NOT NULL DEFAULT 'venta',
  stage_id UUID REFERENCES public.stages(id),
  prioridad TEXT DEFAULT 'media',
  propietario_negocio TEXT,
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
CREATE INDEX idx_negocios_company_id ON public.negocios(company_id);
CREATE INDEX idx_negocios_contact_id ON public.negocios(contact_id);
CREATE INDEX idx_negocios_stage_id ON public.negocios(stage_id);
CREATE INDEX idx_negocios_created_by ON public.negocios(created_by);
CREATE INDEX idx_negocios_is_active ON public.negocios(is_active);

-- Crear políticas RLS para negocios
ALTER TABLE public.negocios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create negocios" 
  ON public.negocios 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view active negocios" 
  ON public.negocios 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Users can update their own negocios" 
  ON public.negocios 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own negocios" 
  ON public.negocios 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Migrar datos de deals a negocios (si existen)
INSERT INTO public.negocios (
  nombre_negocio, company_id, contact_id, valor_negocio, moneda, tipo_negocio,
  stage_id, prioridad, propietario_negocio, ebitda, ingresos, multiplicador,
  sector, ubicacion, empleados, descripcion, fuente_lead, proxima_actividad,
  notas, fecha_cierre, is_active, created_by, created_at, updated_at
)
SELECT 
  deal_name, 
  NULL, -- company_id se debe asignar manualmente o crear empresas
  contact_id,
  deal_value,
  currency,
  deal_type,
  stage_id,
  priority,
  deal_owner,
  ebitda,
  revenue,
  multiplier,
  sector,
  location,
  employees,
  description,
  lead_source,
  next_activity,
  notes,
  close_date,
  is_active,
  created_by,
  created_at,
  updated_at
FROM public.deals
WHERE EXISTS (SELECT 1 FROM public.deals LIMIT 1);

-- Agregar trigger para updated_at
CREATE TRIGGER update_negocios_updated_at
  BEFORE UPDATE ON public.negocios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
