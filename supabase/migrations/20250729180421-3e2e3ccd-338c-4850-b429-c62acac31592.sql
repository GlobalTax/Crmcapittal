-- Habilitar RLS en la tabla leads si no está habilitado
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver solo los leads que tienen asignados
CREATE POLICY "leads_select_asignado" ON public.leads
FOR SELECT 
USING (auth.uid() = assigned_to_id);

-- Política para que los usuarios puedan actualizar solo los leads que tienen asignados
CREATE POLICY "leads_update_asignado" ON public.leads
FOR UPDATE 
USING (auth.uid() = assigned_to_id);

-- Política para que los usuarios puedan crear leads (asignándose a sí mismos)
CREATE POLICY "leads_insert_asignado" ON public.leads
FOR INSERT 
WITH CHECK (auth.uid() = assigned_to_id);

-- Habilitar RLS en la tabla lead_interactions si no está habilitado
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver interacciones solo de sus leads asignados
CREATE POLICY "interactions_select_asignado" ON public.lead_interactions
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.leads 
  WHERE leads.id = lead_interactions.lead_id 
  AND leads.assigned_to_id = auth.uid()
));

-- Política para que los usuarios puedan crear interacciones en sus leads asignados
CREATE POLICY "interactions_insert_asignado" ON public.lead_interactions
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.leads 
  WHERE leads.id = lead_interactions.lead_id 
  AND leads.assigned_to_id = auth.uid()
));

-- Política para que los usuarios puedan actualizar interacciones de sus leads asignados
CREATE POLICY "interactions_update_asignado" ON public.lead_interactions
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.leads 
  WHERE leads.id = lead_interactions.lead_id 
  AND leads.assigned_to_id = auth.uid()
));

-- Política para que los usuarios puedan eliminar interacciones de sus leads asignados
CREATE POLICY "interactions_delete_asignado" ON public.lead_interactions
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.leads 
  WHERE leads.id = lead_interactions.lead_id 
  AND leads.assigned_to_id = auth.uid()
));