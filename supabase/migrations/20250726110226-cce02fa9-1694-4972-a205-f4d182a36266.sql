-- Fix security issue: Remove SECURITY DEFINER from KPI view
DROP VIEW IF EXISTS public.vw_reconversion_kpi;

-- Recreate KPI view without SECURITY DEFINER (safer approach)
CREATE VIEW public.vw_reconversion_kpi AS
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE estado = 'activa') as activas,
  COUNT(*) FILTER (WHERE estado = 'matching') as matching,
  COUNT(*) FILTER (WHERE estado = 'negociando') as negociando,
  COUNT(*) FILTER (WHERE estado = 'cerrada') as cerradas,
  COUNT(*) FILTER (WHERE prioridad IN ('alta', 'critica')) as urgentes,
  COUNT(*) FILTER (WHERE estado = 'cancelada') as canceladas
FROM public.reconversiones_new;

-- Create RLS policy for the view (it inherits permissions from the underlying table)
-- Users can only see KPIs for reconversiones they have access to
CREATE OR REPLACE VIEW public.vw_reconversion_kpi_secure AS
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE estado = 'activa') as activas,
  COUNT(*) FILTER (WHERE estado = 'matching') as matching,
  COUNT(*) FILTER (WHERE estado = 'negociando') as negociando,
  COUNT(*) FILTER (WHERE estado = 'cerrada') as cerradas,
  COUNT(*) FILTER (WHERE prioridad IN ('alta', 'critica')) as urgentes,
  COUNT(*) FILTER (WHERE estado = 'cancelada') as canceladas
FROM public.reconversiones_new
WHERE 
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR 
  auth.uid() = pipeline_owner_id OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  );