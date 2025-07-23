
-- Fase 1: Corrección de Errores Críticos

-- 1. Añadir el campo 'priority' que falta en la tabla reconversiones
ALTER TABLE public.reconversiones 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- 2. Crear índice para el campo priority
CREATE INDEX IF NOT EXISTS idx_reconversiones_priority ON public.reconversiones(priority);

-- 3. Actualizar registros existentes para tener una prioridad válida
UPDATE public.reconversiones 
SET priority = 'medium' 
WHERE priority IS NULL;

-- 4. Crear la vista reconversiones_with_relations de forma correcta
DROP VIEW IF EXISTS public.reconversiones_with_relations;
CREATE VIEW public.reconversiones_with_relations AS
SELECT 
  r.id,
  r.company_name,
  r.contact_name,
  r.contact_email,
  r.contact_phone,
  r.rejection_reason,
  r.target_sectors,
  r.investment_capacity_min,
  r.investment_capacity_max,
  r.geographic_preferences,
  r.business_model_preferences,
  r.priority,
  r.status,
  r.notes,
  r.assigned_to,
  r.created_by,
  r.original_lead_id,
  r.original_mandate_id,
  r.created_at,
  r.updated_at,
  l.name as original_lead_name,
  l.email as original_lead_email,
  l.company_name as original_lead_company,
  l.status as original_lead_status,
  bm.mandate_name as original_mandate_name,
  bm.client_name as original_mandate_client,
  bm.status as original_mandate_status,
  bm.target_sectors as original_mandate_sectors
FROM public.reconversiones r
LEFT JOIN public.leads l ON r.original_lead_id = l.id
LEFT JOIN public.buying_mandates bm ON r.original_mandate_id = bm.id;

-- 5. Crear políticas RLS faltantes para reconversiones
DROP POLICY IF EXISTS "Users can view their reconversions or admin" ON public.reconversiones;
DROP POLICY IF EXISTS "Users can create reconversions" ON public.reconversiones;
DROP POLICY IF EXISTS "Users can update their reconversions or admin" ON public.reconversiones;
DROP POLICY IF EXISTS "Admins can delete reconversions" ON public.reconversiones;

CREATE POLICY "Users can view their reconversions or admin" 
  ON public.reconversiones 
  FOR SELECT 
  USING (
    created_by = auth.uid() OR 
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can create reconversions" 
  ON public.reconversiones 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their reconversions or admin" 
  ON public.reconversiones 
  FOR UPDATE 
  USING (
    created_by = auth.uid() OR 
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete reconversions" 
  ON public.reconversiones 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- 6. Habilitar RLS en reconversiones si no está habilitado
ALTER TABLE public.reconversiones ENABLE ROW LEVEL SECURITY;

-- 7. Insertar algunos datos de ejemplo realistas
INSERT INTO public.reconversiones (
  company_name,
  contact_name,
  contact_email,
  contact_phone,
  rejection_reason,
  target_sectors,
  investment_capacity_min,
  investment_capacity_max,
  geographic_preferences,
  business_model_preferences,
  priority,
  status,
  notes,
  created_by,
  assigned_to
) VALUES 
(
  'TechStartup Solutions SL',
  'María García',
  'maria.garcia@techstartup.es',
  '+34 91 123 4567',
  'Valoración inicial demasiado alta para el perfil del inversor',
  ARRAY['tecnología', 'software', 'fintech'],
  50000,
  200000,
  ARRAY['Madrid', 'Barcelona', 'Valencia'],
  ARRAY['B2B', 'SaaS'],
  'high',
  'active',
  'Empresa prometedora con buen equipo técnico. Podría ser interesante para inversores más especializados en early stage.',
  auth.uid(),
  auth.uid()
) ON CONFLICT DO NOTHING;

INSERT INTO public.reconversiones (
  company_name,
  contact_name,
  contact_email,
  contact_phone,
  rejection_reason,
  target_sectors,
  investment_capacity_min,
  investment_capacity_max,
  geographic_preferences,
  business_model_preferences,
  priority,
  status,
  notes,
  created_by,
  assigned_to
) VALUES 
(
  'Distribuidora Alimentaria Norte',
  'Carlos Ruiz',
  'carlos.ruiz@dan.es',
  '+34 94 765 4321',
  'El mandato actual se centra en retail, no en distribución mayorista',
  ARRAY['alimentación', 'distribución', 'retail'],
  100000,
  500000,
  ARRAY['País Vasco', 'Cantabria', 'Asturias'],
  ARRAY['B2B', 'tradicional'],
  'medium',
  'matching',
  'Negocio familiar consolidado con 25 años de experiencia. Buscan socio para expansión.',
  auth.uid(),
  NULL
) ON CONFLICT DO NOTHING;
