
-- Añadir campos faltantes a la tabla reconversiones para vinculación completa
ALTER TABLE public.reconversiones 
ADD COLUMN IF NOT EXISTS original_lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS original_mandate_id UUID REFERENCES public.buying_mandates(id) ON DELETE SET NULL;

-- Crear tabla para historial de estados de reconversión
CREATE TABLE IF NOT EXISTS public.reconversion_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reconversion_id UUID REFERENCES public.reconversiones(id) ON DELETE CASCADE NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para la tabla de historial
ALTER TABLE public.reconversion_status_history ENABLE ROW LEVEL SECURITY;

-- Política para ver historial de estados
CREATE POLICY "Users can view reconversion status history" 
  ON public.reconversion_status_history 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.reconversiones 
      WHERE id = reconversion_status_history.reconversion_id 
      AND (created_by = auth.uid() OR assigned_to = auth.uid())
    ) OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'superadmin')
  );

-- Función para sincronizar estados entre reconversión y lead/mandato original
CREATE OR REPLACE FUNCTION public.sync_reconversion_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  old_status TEXT;
  new_status TEXT;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    old_status := OLD.status;
    new_status := NEW.status;
    
    -- Registrar cambio de estado en historial
    INSERT INTO public.reconversion_status_history (
      reconversion_id,
      previous_status,
      new_status,
      changed_by,
      change_reason,
      metadata
    ) VALUES (
      NEW.id,
      old_status,
      new_status,
      auth.uid(),
      'Estado actualizado automáticamente',
      jsonb_build_object(
        'automated', true,
        'timestamp', now(),
        'original_lead_id', NEW.original_lead_id,
        'original_mandate_id', NEW.original_mandate_id
      )
    );
    
    -- Actualizar lead original si existe
    IF NEW.original_lead_id IS NOT NULL THEN
      UPDATE public.leads 
      SET 
        notes = COALESCE(notes, '') || 
          CASE WHEN notes IS NOT NULL AND notes != '' THEN E'\n' ELSE '' END ||
          '[Reconversión ' || NEW.company_name || '] Estado: ' || new_status || ' - ' || now()::date,
        updated_at = now()
      WHERE id = NEW.original_lead_id;
    END IF;
    
    -- Si la reconversión se cierra exitosamente, actualizar el mandato
    IF NEW.original_mandate_id IS NOT NULL AND new_status = 'closed' THEN
      -- Aquí podrías agregar lógica específica para actualizar el mandato
      -- por ejemplo, marcar como parcialmente completado si se encontró un candidato
      NULL; -- Placeholder para lógica futura
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger para sincronización de estados
DROP TRIGGER IF EXISTS sync_reconversion_status_trigger ON public.reconversiones;
CREATE TRIGGER sync_reconversion_status_trigger
  AFTER UPDATE ON public.reconversiones
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_reconversion_status();

-- Índices para mejorar rendimiento de consultas relacionales
CREATE INDEX IF NOT EXISTS idx_reconversiones_original_lead ON public.reconversiones(original_lead_id);
CREATE INDEX IF NOT EXISTS idx_reconversiones_original_mandate ON public.reconversiones(original_mandate_id);
CREATE INDEX IF NOT EXISTS idx_reconversion_status_history_reconversion ON public.reconversion_status_history(reconversion_id);

-- Vista materializada para reconversiones con información completa
CREATE OR REPLACE VIEW public.reconversiones_with_relations AS
SELECT 
  r.*,
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

-- Habilitar RLS para la vista
ALTER VIEW public.reconversiones_with_relations SET (security_barrier = true);

-- Política para la vista
CREATE POLICY "Users can view reconversions with relations" 
  ON public.reconversiones_with_relations
  FOR SELECT 
  USING (
    created_by = auth.uid() OR 
    assigned_to = auth.uid() OR
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'superadmin')
  );
