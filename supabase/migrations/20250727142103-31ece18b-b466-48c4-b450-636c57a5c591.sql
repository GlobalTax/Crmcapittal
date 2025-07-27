
-- 1. Create sectores table
CREATE TABLE IF NOT EXISTS public.sectores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL UNIQUE,
  descripcion text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for sectores table
ALTER TABLE public.sectores ENABLE ROW LEVEL SECURITY;

-- Create policy for sectores (readable by all authenticated users)
CREATE POLICY "Users can view sectores" ON public.sectores
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin users can manage sectores" ON public.sectores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Insert default sectors
INSERT INTO public.sectores (nombre, descripcion) VALUES 
  ('Tecnología', 'Empresas de tecnología, software y servicios digitales'),
  ('Salud', 'Servicios de salud, farmacéuticas y biotecnología'),
  ('Finanzas', 'Banca, seguros y servicios financieros'),
  ('Inmobiliario', 'Desarrollo inmobiliario y construcción'),
  ('Retail', 'Comercio minorista y distribución'),
  ('Manufactura', 'Industria manufacturera y producción'),
  ('Educación', 'Servicios educativos y formación'),
  ('Alimentación', 'Industria alimentaria y bebidas'),
  ('Energía', 'Energía renovable y tradicional'),
  ('Servicios', 'Servicios profesionales y consultoría'),
  ('Turismo', 'Turismo, hotelería y entretenimiento'),
  ('Transporte', 'Logística y transporte'),
  ('Agricultura', 'Agricultura y ganadería'),
  ('Otros', 'Otros sectores no especificados')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Create lead_stage enum
CREATE TYPE lead_stage AS ENUM (
  'pipeline', 
  'cualificado', 
  'propuesta', 
  'negociacion', 
  'ganado', 
  'perdido'
);

-- 3. Add missing columns to leads table
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS valor_estimado numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stage lead_stage DEFAULT 'pipeline',
  ADD COLUMN IF NOT EXISTS prob_conversion numeric DEFAULT 0 CHECK (prob_conversion >= 0 AND prob_conversion <= 100),
  ADD COLUMN IF NOT EXISTS source_detail text,
  ADD COLUMN IF NOT EXISTS sector_id uuid REFERENCES public.sectores(id),
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS last_contacted timestamp with time zone,
  ADD COLUMN IF NOT EXISTS next_action_date date,
  ADD COLUMN IF NOT EXISTS aipersona jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS extra jsonb DEFAULT '{}';

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_sector_id ON public.leads(sector_id);
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON public.leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_next_action_date ON public.leads(next_action_date);
CREATE INDEX IF NOT EXISTS idx_leads_last_contacted ON public.leads(last_contacted);

-- 5. Create trigger to update updated_at on sectores
CREATE OR REPLACE FUNCTION update_sectores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sectores_updated_at
    BEFORE UPDATE ON public.sectores
    FOR EACH ROW
    EXECUTE FUNCTION update_sectores_updated_at();

-- 6. Migrate existing data where possible
-- Map existing deal_value to valor_estimado if valor_estimado is 0
UPDATE public.leads 
SET valor_estimado = COALESCE(deal_value, 0) 
WHERE valor_estimado = 0 AND deal_value IS NOT NULL AND deal_value > 0;

-- Map existing probability to prob_conversion if prob_conversion is 0
UPDATE public.leads 
SET prob_conversion = COALESCE(probability, 0) 
WHERE prob_conversion = 0 AND probability IS NOT NULL AND probability > 0;

-- Set default sector for existing leads without sector
UPDATE public.leads 
SET sector_id = (SELECT id FROM public.sectores WHERE nombre = 'Otros' LIMIT 1)
WHERE sector_id IS NULL;

-- Set owner_id to assigned_to_id where available
UPDATE public.leads 
SET owner_id = assigned_to_id 
WHERE owner_id IS NULL AND assigned_to_id IS NOT NULL;

-- Set last_contacted based on updated_at for existing leads
UPDATE public.leads 
SET last_contacted = updated_at 
WHERE last_contacted IS NULL;
