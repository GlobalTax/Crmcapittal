
-- Crear tabla de áreas de práctica
CREATE TABLE public.practice_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insertar áreas de práctica por defecto
INSERT INTO public.practice_areas (name, description, color) VALUES
('Fiscal', 'Asesoría fiscal y tributaria', '#10B981'),
('Contabilidad', 'Servicios de contabilidad y administración', '#3B82F6'),
('Laboral', 'Derecho laboral y recursos humanos', '#F59E0B'),
('Legal', 'Asesoría jurídica general', '#EF4444'),
('Mercantil', 'Derecho mercantil y societario', '#8B5CF6');

-- Crear tabla de propuestas comerciales
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  practice_area_id UUID REFERENCES public.practice_areas(id),
  title TEXT NOT NULL,
  description TEXT,
  total_amount NUMERIC(10,2),
  currency TEXT DEFAULT 'EUR',
  proposal_type TEXT NOT NULL DEFAULT 'punctual', -- 'punctual' o 'recurring'
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'approved', 'rejected', 'expired'
  valid_until DATE,
  terms_and_conditions TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID
);

-- Crear tabla de expedientes (casos)
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT NOT NULL UNIQUE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  practice_area_id UUID NOT NULL REFERENCES public.practice_areas(id),
  proposal_id UUID REFERENCES public.proposals(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'suspended', 'cancelled'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  estimated_hours NUMERIC(8,2),
  actual_hours NUMERIC(8,2) DEFAULT 0,
  assigned_to UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de cuotas recurrentes
CREATE TABLE public.recurring_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  practice_area_id UUID NOT NULL REFERENCES public.practice_areas(id),
  proposal_id UUID REFERENCES public.proposals(id),
  fee_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  billing_frequency TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'quarterly', 'yearly'
  billing_type TEXT NOT NULL DEFAULT 'fixed', -- 'fixed', 'per_employee', 'per_service'
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de histórico de cuotas
CREATE TABLE public.fee_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recurring_fee_id UUID NOT NULL REFERENCES public.recurring_fees(id) ON DELETE CASCADE,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'invoiced', 'paid', 'cancelled'
  invoice_number TEXT,
  invoice_date DATE,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_proposals_contact_id ON public.proposals(contact_id);
CREATE INDEX idx_proposals_company_id ON public.proposals(company_id);
CREATE INDEX idx_proposals_practice_area_id ON public.proposals(practice_area_id);
CREATE INDEX idx_proposals_status ON public.proposals(status);

CREATE INDEX idx_cases_contact_id ON public.cases(contact_id);
CREATE INDEX idx_cases_company_id ON public.cases(company_id);
CREATE INDEX idx_cases_practice_area_id ON public.cases(practice_area_id);
CREATE INDEX idx_cases_proposal_id ON public.cases(proposal_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_case_number ON public.cases(case_number);

CREATE INDEX idx_recurring_fees_contact_id ON public.recurring_fees(contact_id);
CREATE INDEX idx_recurring_fees_company_id ON public.recurring_fees(company_id);
CREATE INDEX idx_recurring_fees_practice_area_id ON public.recurring_fees(practice_area_id);
CREATE INDEX idx_recurring_fees_is_active ON public.recurring_fees(is_active);

CREATE INDEX idx_fee_history_recurring_fee_id ON public.fee_history(recurring_fee_id);
CREATE INDEX idx_fee_history_status ON public.fee_history(status);
CREATE INDEX idx_fee_history_billing_period ON public.fee_history(billing_period_start, billing_period_end);

-- Crear triggers para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_practice_areas_updated_at BEFORE UPDATE ON public.practice_areas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_fees_updated_at BEFORE UPDATE ON public.recurring_fees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fee_history_updated_at BEFORE UPDATE ON public.fee_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Crear función para generar números de expediente automáticamente
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
    NEW.case_number := 'EXP-' || TO_CHAR(now(), 'YYYY') || '-' || 
                       LPAD(NEXTVAL('case_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear secuencia para números de expediente
CREATE SEQUENCE case_number_seq START 1;

-- Crear trigger para generar números de expediente automáticamente
CREATE TRIGGER generate_case_number_trigger
  BEFORE INSERT ON public.cases
  FOR EACH ROW EXECUTE FUNCTION generate_case_number();

-- Habilitar Row Level Security en las nuevas tablas
ALTER TABLE public.practice_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir todo a usuarios autenticados por ahora)
CREATE POLICY "Users can view practice areas" ON public.practice_areas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage practice areas" ON public.practice_areas FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view proposals" ON public.proposals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage proposals" ON public.proposals FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view cases" ON public.cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage cases" ON public.cases FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view recurring fees" ON public.recurring_fees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage recurring fees" ON public.recurring_fees FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view fee history" ON public.fee_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage fee history" ON public.fee_history FOR ALL TO authenticated USING (true);
