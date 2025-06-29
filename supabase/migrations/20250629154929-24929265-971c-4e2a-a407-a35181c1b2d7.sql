
-- First, update the check constraint to allow DEAL type
ALTER TABLE public.pipelines DROP CONSTRAINT IF EXISTS pipelines_type_check;
ALTER TABLE public.pipelines ADD CONSTRAINT pipelines_type_check 
  CHECK (type IN ('OPERACION', 'PROYECTO', 'LEAD', 'TARGET_COMPANY', 'DEAL'));

-- Now create the DEAL pipeline
INSERT INTO public.pipelines (name, type, description)
VALUES ('Pipeline de Deals M&A', 'DEAL', 'Pipeline para gestionar negocios de M&A');

-- Create default stages for the DEAL pipeline
WITH deal_pipeline AS (
  SELECT id FROM public.pipelines WHERE type = 'DEAL' LIMIT 1
)
INSERT INTO public.stages (name, description, order_index, color, pipeline_id)
SELECT 
  stage_name,
  stage_desc,
  stage_order,
  stage_color,
  deal_pipeline.id
FROM deal_pipeline,
(VALUES 
  ('Lead Valoración', 'Nuevos leads pendientes de valoración inicial', 1, '#6B7280'),
  ('Lead Importante', 'Leads calificados con alto potencial', 2, '#3B82F6'),
  ('Enviado 1r Contacto', 'Primer contacto enviado, esperando respuesta', 3, '#8B5CF6'),
  ('En Contacto', 'En comunicación activa con el cliente', 4, '#06B6D4'),
  ('PSI Enviada', 'Propuesta de servicios de inversión enviada', 5, '#10B981'),
  ('Solicitando Info', 'Solicitando información adicional del cliente', 6, '#F59E0B'),
  ('Realizando Valoración', 'Proceso de valoración en curso', 7, '#EF4444'),
  ('Valoración Entregada', 'Valoración completada y entregada', 8, '#8B5CF6'),
  ('Lead CV', 'Lead convertido a oportunidad', 9, '#059669')
) AS stages(stage_name, stage_desc, stage_order, stage_color);

-- Create deals table with all fields from the CreateDealDialog form
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic deal information
  deal_name TEXT NOT NULL,
  company_name TEXT,
  deal_value BIGINT,
  currency TEXT DEFAULT 'EUR',
  deal_type TEXT NOT NULL DEFAULT 'venta',
  stage_id UUID REFERENCES public.stages(id),
  priority TEXT DEFAULT 'media',
  deal_owner TEXT,
  
  -- Financial information
  ebitda BIGINT,
  revenue BIGINT,
  multiplier DECIMAL(10,2),
  
  -- Company information
  sector TEXT,
  location TEXT,
  employees INTEGER,
  
  -- Contact information
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_role TEXT,
  
  -- Additional information
  description TEXT,
  lead_source TEXT,
  next_activity TEXT,
  notes TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  close_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on deals table
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Create policies for deals
CREATE POLICY "Users can view all active deals" 
  ON public.deals 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Users can create deals" 
  ON public.deals 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own deals" 
  ON public.deals 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own deals" 
  ON public.deals 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Add updated_at trigger
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
