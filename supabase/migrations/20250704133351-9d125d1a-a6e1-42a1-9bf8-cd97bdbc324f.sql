-- Crear enum para tipos de colaboradores
CREATE TYPE collaborator_type AS ENUM ('referente', 'partner_comercial', 'agente', 'freelancer');

-- Crear enum para estado de comisiones
CREATE TYPE commission_status AS ENUM ('pending', 'paid', 'cancelled');

-- Crear tabla de colaboradores
CREATE TABLE public.collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  collaborator_type collaborator_type NOT NULL DEFAULT 'referente',
  commission_percentage DECIMAL(5,2) DEFAULT 0.00,
  base_commission DECIMAL(10,2) DEFAULT 0.00,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Crear tabla de comisiones de colaboradores
CREATE TABLE public.collaborator_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collaborator_id UUID NOT NULL REFERENCES public.collaborators(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  commission_percentage DECIMAL(5,2),
  status commission_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agregar columna collaborator_id a la tabla leads
ALTER TABLE public.leads ADD COLUMN collaborator_id UUID REFERENCES public.collaborators(id) ON DELETE SET NULL;

-- Crear índices para optimizar consultas
CREATE INDEX idx_collaborators_active ON public.collaborators(is_active);
CREATE INDEX idx_collaborators_type ON public.collaborators(collaborator_type);
CREATE INDEX idx_collaborator_commissions_collaborator ON public.collaborator_commissions(collaborator_id);
CREATE INDEX idx_collaborator_commissions_status ON public.collaborator_commissions(status);
CREATE INDEX idx_leads_collaborator ON public.leads(collaborator_id);

-- Trigger para actualizar updated_at en collaborators
CREATE TRIGGER update_collaborators_updated_at
  BEFORE UPDATE ON public.collaborators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para actualizar updated_at en collaborator_commissions
CREATE TRIGGER update_collaborator_commissions_updated_at
  BEFORE UPDATE ON public.collaborator_commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS en las tablas
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborator_commissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para collaborators
CREATE POLICY "Users can view all collaborators" 
  ON public.collaborators FOR SELECT 
  USING (true);

CREATE POLICY "Users can create collaborators" 
  ON public.collaborators FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own collaborators or admins" 
  ON public.collaborators FOR UPDATE 
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admin users can delete collaborators" 
  ON public.collaborators FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Políticas RLS para collaborator_commissions
CREATE POLICY "Users can view all commissions" 
  ON public.collaborator_commissions FOR SELECT 
  USING (true);

CREATE POLICY "Users can create commissions" 
  ON public.collaborator_commissions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admin users can update commissions" 
  ON public.collaborator_commissions FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admin users can delete commissions" 
  ON public.collaborator_commissions FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );