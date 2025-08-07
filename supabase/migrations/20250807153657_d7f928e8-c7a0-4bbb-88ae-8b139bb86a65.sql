-- FASE 1: Tablas para automatización eInforma
CREATE TABLE public.einforma_automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('auto_sync', 'risk_monitor', 'budget_alert', 'coverage_gap')),
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  action_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Alertas y notificaciones eInforma
CREATE TABLE public.einforma_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('risk_change', 'budget_warning', 'sync_error', 'coverage_gap', 'high_cost')),
  company_id UUID REFERENCES public.companies(id),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  alert_data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Seguimiento detallado de costes eInforma
CREATE TABLE public.einforma_cost_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_type TEXT NOT NULL CHECK (consultation_type IN ('basic', 'financial', 'credit', 'directors', 'full')),
  cost_amount DECIMAL(10,2) NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  request_data JSONB DEFAULT '{}',
  response_data JSONB DEFAULT '{}',
  consultation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  billing_month DATE NOT NULL DEFAULT DATE_TRUNC('month', CURRENT_DATE),
  is_bulk_operation BOOLEAN NOT NULL DEFAULT false,
  bulk_discount_applied DECIMAL(5,2) DEFAULT 0,
  cost_prediction_accuracy DECIMAL(5,2)
);

-- Log de sincronizaciones automáticas
CREATE TABLE public.einforma_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('auto_company', 'scheduled_update', 'manual_bulk', 'risk_monitor')),
  companies_processed INTEGER NOT NULL DEFAULT 0,
  companies_successful INTEGER NOT NULL DEFAULT 0,
  companies_failed INTEGER NOT NULL DEFAULT 0,
  total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL CHECK (sync_status IN ('running', 'completed', 'failed', 'cancelled')) DEFAULT 'running',
  error_details JSONB DEFAULT '{}',
  sync_data JSONB DEFAULT '{}',
  started_by UUID REFERENCES auth.users(id),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  next_sync_at TIMESTAMP WITH TIME ZONE
);

-- Métricas y analytics eInforma
CREATE TABLE public.einforma_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('coverage_rate', 'cost_efficiency', 'roi_score', 'risk_alerts', 'sync_performance')),
  metric_value DECIMAL(15,4) NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  company_sector TEXT,
  user_id UUID REFERENCES auth.users(id),
  additional_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Configuración global eInforma
CREATE TABLE public.einforma_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  is_global BOOLEAN NOT NULL DEFAULT true,
  user_id UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.einforma_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.einforma_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.einforma_cost_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.einforma_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.einforma_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.einforma_config ENABLE ROW LEVEL SECURITY;

-- Policies para automation_rules
CREATE POLICY "Users can manage their automation rules" ON public.einforma_automation_rules
  FOR ALL USING (auth.uid() = created_by OR has_role_secure(auth.uid(), 'admin'::app_role));

-- Policies para alerts
CREATE POLICY "Users can view their alerts" ON public.einforma_alerts
  FOR SELECT USING (auth.uid() = user_id OR has_role_secure(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their alerts" ON public.einforma_alerts
  FOR UPDATE USING (auth.uid() = user_id OR has_role_secure(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create alerts" ON public.einforma_alerts
  FOR INSERT WITH CHECK (true);

-- Policies para cost_tracking
CREATE POLICY "Users can view their cost tracking" ON public.einforma_cost_tracking
  FOR SELECT USING (auth.uid() = user_id OR has_role_secure(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert cost tracking" ON public.einforma_cost_tracking
  FOR INSERT WITH CHECK (true);

-- Policies para sync_log
CREATE POLICY "Users can view sync logs" ON public.einforma_sync_log
  FOR SELECT USING (auth.uid() = started_by OR has_role_secure(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage sync logs" ON public.einforma_sync_log
  FOR ALL USING (true);

-- Policies para analytics
CREATE POLICY "Users can view analytics" ON public.einforma_analytics
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL OR has_role_secure(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert analytics" ON public.einforma_analytics
  FOR INSERT WITH CHECK (true);

-- Policies para config
CREATE POLICY "Admins can manage config" ON public.einforma_config
  FOR ALL USING (has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role));

-- Índices para optimización
CREATE INDEX idx_einforma_alerts_user_unread ON public.einforma_alerts(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_einforma_cost_tracking_billing_month ON public.einforma_cost_tracking(billing_month, user_id);
CREATE INDEX idx_einforma_sync_log_status ON public.einforma_sync_log(sync_status, started_at);
CREATE INDEX idx_einforma_analytics_metric_date ON public.einforma_analytics(metric_type, metric_date);

-- Triggers para updated_at
CREATE TRIGGER update_einforma_automation_rules_updated_at
  BEFORE UPDATE ON public.einforma_automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_einforma_config_updated_at
  BEFORE UPDATE ON public.einforma_config
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insertar configuraciones por defecto
INSERT INTO public.einforma_config (config_key, config_value, description) VALUES
('auto_sync_enabled', 'true', 'Habilitar sincronización automática'),
('auto_sync_threshold', '{"min_revenue": 100000, "priority_sectors": ["tecnologia", "industria"]}', 'Criterios para auto-sincronización'),
('risk_monitoring', '{"enabled": true, "check_frequency": "daily", "alert_threshold": "medium"}', 'Configuración de monitoreo de riesgo'),
('cost_limits', '{"monthly_budget": 5000, "alert_at_80_percent": true, "emergency_stop": true}', 'Límites y alertas de coste'),
('bulk_discounts', '{"tier_1": {"min_queries": 50, "discount": 0.1}, "tier_2": {"min_queries": 100, "discount": 0.15}}', 'Descuentos por volumen');