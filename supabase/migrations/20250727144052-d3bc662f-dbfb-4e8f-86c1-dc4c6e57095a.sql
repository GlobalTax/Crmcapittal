-- Crear enum para tipos de interacción
CREATE TYPE interaction_type AS ENUM ('email', 'llamada', 'reunion', 'nota', 'task');

-- Crear tabla lead_interactions
CREATE TABLE public.lead_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  tipo interaction_type NOT NULL,
  detalle text,
  user_id uuid REFERENCES auth.users(id),
  fecha timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para lead_interactions
CREATE POLICY "Usuarios pueden ver interacciones de sus leads"
ON public.lead_interactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.leads 
    WHERE leads.id = lead_interactions.lead_id 
    AND leads.assigned_to_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Usuarios pueden crear interacciones en sus leads"
ON public.lead_interactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.leads 
    WHERE leads.id = lead_interactions.lead_id 
    AND leads.assigned_to_id = auth.uid()
  )
);

CREATE POLICY "Usuarios pueden actualizar sus propias interacciones"
ON public.lead_interactions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propias interacciones"
ON public.lead_interactions
FOR DELETE
USING (auth.uid() = user_id);

-- Crear índices para rendimiento
CREATE INDEX idx_lead_interactions_lead_id ON public.lead_interactions(lead_id);
CREATE INDEX idx_lead_interactions_user_id ON public.lead_interactions(user_id);
CREATE INDEX idx_lead_interactions_fecha ON public.lead_interactions(fecha DESC);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_lead_interactions_updated_at
  BEFORE UPDATE ON public.lead_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();