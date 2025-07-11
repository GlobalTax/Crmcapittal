-- Crear tablas adicionales para el sistema de comisiones avanzado

-- Tabla de reglas de comisión personalizables
CREATE TABLE public.commission_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  collaborator_type collaborator_type,
  collaborator_id UUID REFERENCES public.collaborators(id),
  source_type TEXT NOT NULL CHECK (source_type IN ('lead', 'deal', 'mandate', 'transaction')),
  commission_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  base_commission NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  min_amount NUMERIC(10,2),
  max_amount NUMERIC(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabla de configuración global del sistema de comisiones
CREATE TABLE public.commission_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabla de pagos de comisiones
CREATE TABLE public.commission_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commission_id UUID NOT NULL REFERENCES public.collaborator_commissions(id),
  payment_amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT,
  payment_reference TEXT,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabla de aprobaciones de comisiones
CREATE TABLE public.commission_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commission_id UUID NOT NULL REFERENCES public.collaborator_commissions(id),
  approved_by UUID NOT NULL REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approval_notes TEXT
);

-- Habilitar RLS en todas las nuevas tablas
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_approvals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Solo superadmins pueden gestionar comisiones
CREATE POLICY "Solo superadmins pueden gestionar reglas de comisión"
ON public.commission_rules FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'::app_role
  )
);

CREATE POLICY "Solo superadmins pueden gestionar configuración de comisiones"
ON public.commission_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'::app_role
  )
);

CREATE POLICY "Solo superadmins pueden gestionar pagos de comisiones"
ON public.commission_payments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'::app_role
  )
);

CREATE POLICY "Solo superadmins pueden gestionar aprobaciones de comisiones"
ON public.commission_approvals FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'::app_role
  )
);

-- Agregar columnas adicionales a la tabla existente de comisiones
ALTER TABLE public.collaborator_commissions 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'deal',
ADD COLUMN IF NOT EXISTS source_name TEXT,
ADD COLUMN IF NOT EXISTS calculation_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS payment_due_date TIMESTAMP WITH TIME ZONE;

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_commission_rules_updated_at 
BEFORE UPDATE ON public.commission_rules 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commission_settings_updated_at 
BEFORE UPDATE ON public.commission_settings 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar configuración inicial del sistema
INSERT INTO public.commission_settings (setting_key, setting_value, description) VALUES
('auto_calculate_commissions', '{"enabled": true}', 'Calcular comisiones automáticamente'),
('default_commission_percentage', '{"percentage": 5.0}', 'Porcentaje de comisión por defecto'),
('approval_required', '{"enabled": true}', 'Requiere aprobación para pagos'),
('payment_schedule', '{"frequency": "monthly"}', 'Frecuencia de pagos de comisiones')
ON CONFLICT (setting_key) DO NOTHING;