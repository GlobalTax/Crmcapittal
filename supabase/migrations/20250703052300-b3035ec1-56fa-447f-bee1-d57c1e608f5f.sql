
-- Crear tabla para gestionar transacciones M&A
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES public.proposals(id) NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  contact_id UUID REFERENCES public.contacts(id),
  transaction_type TEXT NOT NULL DEFAULT 'sale',
  status TEXT NOT NULL DEFAULT 'nda_pending',
  priority TEXT DEFAULT 'medium',
  estimated_value BIGINT,
  currency TEXT DEFAULT 'EUR',
  expected_closing_date DATE,
  transaction_code TEXT UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Crear tabla para NDAs (Non-Disclosure Agreements)
CREATE TABLE public.ndas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id) NOT NULL,
  nda_type TEXT NOT NULL DEFAULT 'bilateral',
  status TEXT NOT NULL DEFAULT 'draft',
  document_url TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  signed_by_client BOOLEAN DEFAULT false,
  signed_by_advisor BOOLEAN DEFAULT false,
  terms_and_conditions TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Crear tabla para Teasers Ciegos
CREATE TABLE public.teasers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id) NOT NULL,
  teaser_type TEXT NOT NULL DEFAULT 'blind',
  status TEXT NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL,
  anonymous_company_name TEXT,
  sector TEXT,
  location TEXT,
  revenue BIGINT,
  ebitda BIGINT,
  employees INTEGER,
  asking_price BIGINT,
  currency TEXT DEFAULT 'EUR',
  key_highlights TEXT[],
  financial_summary JSONB,
  document_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  distributed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Crear tabla para Info Memos
CREATE TABLE public.info_memos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL,
  executive_summary TEXT,
  company_overview TEXT,
  market_analysis TEXT,
  financial_information JSONB,
  growth_opportunities TEXT,
  risk_factors TEXT,
  management_team JSONB,
  document_url TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Crear tabla para tracking de acceso a documentos
CREATE TABLE public.document_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT NOT NULL, -- 'teaser', 'info_memo', 'nda'
  document_id UUID NOT NULL,
  contact_id UUID REFERENCES public.contacts(id),
  access_type TEXT NOT NULL DEFAULT 'view', -- 'view', 'download', 'share'
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_duration INTEGER -- in seconds
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_transactions_proposal_id ON public.transactions(proposal_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_ndas_transaction_id ON public.ndas(transaction_id);
CREATE INDEX idx_ndas_status ON public.ndas(status);
CREATE INDEX idx_teasers_transaction_id ON public.teasers(transaction_id);
CREATE INDEX idx_info_memos_transaction_id ON public.info_memos(transaction_id);
CREATE INDEX idx_document_access_logs_document ON public.document_access_logs(document_type, document_id);

-- Crear función para generar código único de transacción
CREATE OR REPLACE FUNCTION generate_transaction_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_code IS NULL THEN
    NEW.transaction_code := 'TXN-' || TO_CHAR(now(), 'YYYY') || '-' || 
                           LPAD(NEXTVAL('transaction_code_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear secuencia para códigos de transacción
CREATE SEQUENCE IF NOT EXISTS transaction_code_seq START 1;

-- Crear trigger para generar código automáticamente
CREATE TRIGGER generate_transaction_code_trigger
  BEFORE INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION generate_transaction_code();

-- Crear trigger para updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ndas_updated_at
  BEFORE UPDATE ON public.ndas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teasers_updated_at
  BEFORE UPDATE ON public.teasers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_info_memos_updated_at
  BEFORE UPDATE ON public.info_memos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS en todas las tablas
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ndas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teasers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.info_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_logs ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para transactions
CREATE POLICY "Users can view all transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own transactions" 
  ON public.transactions 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Crear políticas RLS para NDAs
CREATE POLICY "Users can view all ndas" 
  ON public.ndas 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create ndas" 
  ON public.ndas 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own ndas" 
  ON public.ndas 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Crear políticas RLS para Teasers
CREATE POLICY "Users can view all teasers" 
  ON public.teasers 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create teasers" 
  ON public.teasers 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own teasers" 
  ON public.teasers 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Crear políticas RLS para Info Memos
CREATE POLICY "Users can view all info_memos" 
  ON public.info_memos 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create info_memos" 
  ON public.info_memos 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own info_memos" 
  ON public.info_memos 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Crear políticas RLS para Document Access Logs
CREATE POLICY "Users can view all document_access_logs" 
  ON public.document_access_logs 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert document_access_logs" 
  ON public.document_access_logs 
  FOR INSERT 
  WITH CHECK (true);
