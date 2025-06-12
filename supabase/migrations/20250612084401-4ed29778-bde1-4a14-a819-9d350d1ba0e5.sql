
-- Agregar campos financieros a la tabla operations
ALTER TABLE public.operations 
ADD COLUMN revenue BIGINT,
ADD COLUMN ebitda BIGINT,
ADD COLUMN annual_growth_rate DECIMAL(5,2);

-- Actualizar las operaciones existentes con datos de ejemplo
UPDATE public.operations 
SET 
  revenue = CASE 
    WHEN company_name = 'TechFlow Solutions' THEN 15000000
    WHEN company_name = 'Green Energy Partners' THEN 45000000
    WHEN company_name = 'HealthTech Innovations' THEN 8000000
    ELSE 10000000
  END,
  ebitda = CASE 
    WHEN company_name = 'TechFlow Solutions' THEN 3000000
    WHEN company_name = 'Green Energy Partners' THEN 12000000
    WHEN company_name = 'HealthTech Innovations' THEN 1200000
    ELSE 2000000
  END,
  annual_growth_rate = CASE 
    WHEN company_name = 'TechFlow Solutions' THEN 25.0
    WHEN company_name = 'Green Energy Partners' THEN 18.5
    WHEN company_name = 'HealthTech Innovations' THEN 35.0
    ELSE 15.0
  END;
