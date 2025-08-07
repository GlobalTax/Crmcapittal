-- ===== FASE A: COLABORADORES AVANZADO =====

-- 1. Performance Tracking para Colaboradores
CREATE TABLE public.collaborator_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID REFERENCES public.collaborators(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue NUMERIC DEFAULT 0,
  deals_closed INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  performance_score INTEGER DEFAULT 0,
  ranking_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Commission Management Avanzado
CREATE TABLE public.commission_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID REFERENCES public.collaborators(id) ON DELETE CASCADE,
  deal_id UUID,
  calculation_type TEXT NOT NULL DEFAULT 'percentage',
  base_amount NUMERIC NOT NULL,
  commission_rate NUMERIC NOT NULL,
  calculated_amount NUMERIC NOT NULL,
  calculation_details JSONB DEFAULT '{}',
  status TEXT DEFAULT 'calculated' CHECK (status IN ('calculated', 'approved', 'disputed', 'paid')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.commission_escrow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id UUID REFERENCES public.commission_calculations(id) ON DELETE CASCADE,
  escrow_amount NUMERIC NOT NULL,
  release_conditions JSONB DEFAULT '{}',
  hold_reason TEXT,
  expected_release_date DATE,
  status TEXT DEFAULT 'held' CHECK (status IN ('held', 'released', 'disputed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Territory Management
CREATE TABLE public.territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  territory_type TEXT NOT NULL CHECK (territory_type IN ('geographic', 'sector', 'account')),
  boundaries JSONB DEFAULT '{}', -- Geographic coordinates or sector definitions
  exclusivity_level TEXT DEFAULT 'shared' CHECK (exclusivity_level IN ('exclusive', 'shared', 'collaborative')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.collaborator_territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID REFERENCES public.collaborators(id) ON DELETE CASCADE,
  territory_id UUID REFERENCES public.territories(id) ON DELETE CASCADE,
  assignment_type TEXT DEFAULT 'primary' CHECK (assignment_type IN ('primary', 'secondary', 'support')),
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(collaborator_id, territory_id)
);

-- ===== FASE B: ROLES & USUARIOS EMPRESARIAL =====

-- 1. Advanced RBAC System
CREATE TYPE public.enterprise_role AS ENUM (
  'superadmin', 'admin', 'regional_manager', 'sales_manager', 
  'sales_rep', 'analyst', 'viewer', 'contractor'
);

CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role enterprise_role NOT NULL,
  permission_module TEXT NOT NULL,
  permission_action TEXT NOT NULL,
  resource_type TEXT,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, permission_module, permission_action, resource_type)
);

CREATE TABLE public.user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role enterprise_role NOT NULL,
  assigned_by UUID,
  effective_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  effective_to TIMESTAMP WITH TIME ZONE,
  assignment_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. User Lifecycle Management
CREATE TABLE public.user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  onboarding_template JSONB NOT NULL,
  completed_steps JSONB DEFAULT '[]',
  progress_percentage INTEGER DEFAULT 0,
  assigned_mentor UUID,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completion_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.user_deactivations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  deactivated_by UUID NOT NULL,
  deactivation_reason TEXT NOT NULL,
  asset_transfer_to UUID,
  data_retention_period INTEGER DEFAULT 90,
  deactivation_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  scheduled_deletion_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Enhanced Audit Trail
CREATE TABLE public.enhanced_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  action_details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  geo_location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  INDEX(user_id, created_at),
  INDEX(action_type, created_at),
  INDEX(risk_level, created_at)
);

-- ===== FASE C: INTEGRATION MARKETPLACE =====

-- 1. Integration Hub
CREATE TABLE public.integration_marketplace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  developer_name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  icon_url TEXT,
  screenshots JSONB DEFAULT '[]',
  pricing_model TEXT DEFAULT 'free' CHECK (pricing_model IN ('free', 'paid', 'freemium')),
  pricing_details JSONB DEFAULT '{}',
  installation_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  configuration_schema JSONB DEFAULT '{}',
  webhook_endpoints JSONB DEFAULT '[]',
  required_permissions JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'deprecated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  integration_id UUID REFERENCES public.integration_marketplace(id) ON DELETE CASCADE,
  configuration JSONB DEFAULT '{}',
  api_credentials JSONB DEFAULT '{}', -- Encrypted
  installation_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'paused', 'error', 'disabled')),
  error_log JSONB DEFAULT '[]',
  usage_stats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, integration_id)
);

-- 2. API Management
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  integration_id UUID REFERENCES public.integration_marketplace(id),
  key_name TEXT NOT NULL,
  api_key_hash TEXT NOT NULL, -- Stored as hash
  key_prefix TEXT NOT NULL, -- First 8 chars for identification
  permissions JSONB DEFAULT '[]',
  rate_limit_per_hour INTEGER DEFAULT 1000,
  rate_limit_per_day INTEGER DEFAULT 10000,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  response_status INTEGER NOT NULL,
  response_time_ms INTEGER,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  INDEX(api_key_id, created_at),
  INDEX(endpoint, created_at)
);

-- 3. Visual Workflow Engine
CREATE TABLE public.workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  template_data JSONB NOT NULL,
  trigger_types JSONB DEFAULT '[]',
  action_types JSONB DEFAULT '[]',
  complexity_level TEXT DEFAULT 'beginner' CHECK (complexity_level IN ('beginner', 'intermediate', 'advanced')),
  usage_count INTEGER DEFAULT 0,
  created_by UUID,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.user_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  template_id UUID REFERENCES public.workflow_templates(id),
  name TEXT NOT NULL,
  description TEXT,
  workflow_definition JSONB NOT NULL,
  trigger_config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  execution_count INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  last_execution TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.user_workflows(id) ON DELETE CASCADE,
  execution_context JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  error_message TEXT,
  execution_logs JSONB DEFAULT '[]',
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===== FASE D: SYSTEM INTELLIGENCE =====

-- 1. System Monitoring
CREATE TABLE public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT DEFAULT 'count',
  dimensions JSONB DEFAULT '{}',
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  INDEX(metric_type, metric_name, collected_at),
  INDEX(collected_at)
);

CREATE TABLE public.user_activity_heatmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  page_path TEXT NOT NULL,
  action_type TEXT NOT NULL,
  session_id TEXT,
  duration_seconds INTEGER,
  interaction_count INTEGER DEFAULT 1,
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  INDEX(user_id, created_at),
  INDEX(page_path, created_at)
);

-- 2. Business Intelligence
CREATE TABLE public.feature_adoption_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name TEXT NOT NULL,
  user_id UUID,
  adoption_stage TEXT NOT NULL CHECK (adoption_stage IN ('discovered', 'tried', 'adopted', 'champion')),
  first_use_date TIMESTAMP WITH TIME ZONE,
  last_use_date TIMESTAMP WITH TIME ZONE,
  usage_frequency TEXT DEFAULT 'never' CHECK (usage_frequency IN ('never', 'rarely', 'occasionally', 'frequently', 'daily')),
  proficiency_score INTEGER DEFAULT 0 CHECK (proficiency_score >= 0 AND proficiency_score <= 100),
  feedback_score INTEGER CHECK (feedback_score >= 1 AND feedback_score <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(feature_name, user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.collaborator_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_escrow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborator_territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_deactivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_heatmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_adoption_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Collaborator Performance
CREATE POLICY "Admin users can manage collaborator performance" ON public.collaborator_performance
  FOR ALL USING (has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin'));

CREATE POLICY "Collaborators can view their own performance" ON public.collaborator_performance
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.collaborators c 
    WHERE c.id = collaborator_performance.collaborator_id AND c.user_id = auth.uid()
  ));

-- RLS Policies for Commission Management
CREATE POLICY "Admin users can manage commission calculations" ON public.commission_calculations
  FOR ALL USING (has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin'));

CREATE POLICY "Collaborators can view their own commissions" ON public.commission_calculations
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.collaborators c 
    WHERE c.id = commission_calculations.collaborator_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Admin users can manage commission escrow" ON public.commission_escrow
  FOR ALL USING (has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin'));

-- RLS Policies for Territories
CREATE POLICY "Admin users can manage territories" ON public.territories
  FOR ALL USING (has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin'));

CREATE POLICY "Users can view territories" ON public.territories
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage collaborator territories" ON public.collaborator_territories
  FOR ALL USING (has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin'));

-- RLS Policies for Enhanced RBAC
CREATE POLICY "Admin users can manage role permissions" ON public.role_permissions
  FOR ALL USING (has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin'));

CREATE POLICY "Admin users can manage user role assignments" ON public.user_role_assignments
  FOR ALL USING (has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin'));

-- RLS Policies for User Lifecycle
CREATE POLICY "Admin users can manage user onboarding" ON public.user_onboarding
  FOR ALL USING (has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin'));

CREATE POLICY "Users can view their own onboarding" ON public.user_onboarding
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin users can manage user deactivations" ON public.user_deactivations
  FOR ALL USING (has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin'));

-- RLS Policies for Enhanced Audit Logs
CREATE POLICY "Admin users can view enhanced audit logs" ON public.enhanced_audit_logs
  FOR SELECT USING (has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin'));

CREATE POLICY "System can insert enhanced audit logs" ON public.enhanced_audit_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for Integration Marketplace
CREATE POLICY "Users can view approved integrations" ON public.integration_marketplace
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Admin users can manage integration marketplace" ON public.integration_marketplace
  FOR ALL USING (has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin'));

-- RLS Policies for User Integrations
CREATE POLICY "Users can manage their own integrations" ON public.user_integrations
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for API Management
CREATE POLICY "Users can manage their own API keys" ON public.api_keys
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their own API usage logs" ON public.api_usage_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.api_keys ak 
    WHERE ak.id = api_usage_logs.api_key_id AND ak.user_id = auth.uid()
  ));

CREATE POLICY "System can insert API usage logs" ON public.api_usage_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for Workflow Engine
CREATE POLICY "Users can view public workflow templates" ON public.workflow_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can manage their own workflow templates" ON public.workflow_templates
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Users can manage their own workflows" ON public.user_workflows
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their own workflow executions" ON public.workflow_executions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.user_workflows uw 
    WHERE uw.id = workflow_executions.workflow_id AND uw.user_id = auth.uid()
  ));

CREATE POLICY "System can insert workflow executions" ON public.workflow_executions
  FOR INSERT WITH CHECK (true);

-- RLS Policies for System Intelligence
CREATE POLICY "Admin users can manage system metrics" ON public.system_metrics
  FOR ALL USING (has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin'));

CREATE POLICY "System can insert system metrics" ON public.system_metrics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin users can view user activity heatmaps" ON public.user_activity_heatmaps
  FOR SELECT USING (has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin'));

CREATE POLICY "System can insert user activity heatmaps" ON public.user_activity_heatmaps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin users can view feature adoption metrics" ON public.feature_adoption_metrics
  FOR SELECT USING (has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin'));

CREATE POLICY "Users can view their own feature adoption" ON public.feature_adoption_metrics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage feature adoption metrics" ON public.feature_adoption_metrics
  FOR ALL WITH CHECK (true);

-- Triggers for updated_at columns
CREATE TRIGGER update_collaborator_performance_updated_at
  BEFORE UPDATE ON public.collaborator_performance
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_commission_calculations_updated_at
  BEFORE UPDATE ON public.commission_calculations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_commission_escrow_updated_at
  BEFORE UPDATE ON public.commission_escrow
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_territories_updated_at
  BEFORE UPDATE ON public.territories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_role_assignments_updated_at
  BEFORE UPDATE ON public.user_role_assignments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_onboarding_updated_at
  BEFORE UPDATE ON public.user_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_integration_marketplace_updated_at
  BEFORE UPDATE ON public.integration_marketplace
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_integrations_updated_at
  BEFORE UPDATE ON public.user_integrations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_workflow_templates_updated_at
  BEFORE UPDATE ON public.workflow_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_workflows_updated_at
  BEFORE UPDATE ON public.user_workflows
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_feature_adoption_metrics_updated_at
  BEFORE UPDATE ON public.feature_adoption_metrics
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default role permissions
INSERT INTO public.role_permissions (role, permission_module, permission_action) VALUES
-- SuperAdmin - Full access to everything
('superadmin', 'system', 'manage'),
('superadmin', 'users', 'manage'),
('superadmin', 'collaborators', 'manage'),
('superadmin', 'commissions', 'manage'),
('superadmin', 'territories', 'manage'),
('superadmin', 'integrations', 'manage'),
('superadmin', 'workflows', 'manage'),
('superadmin', 'analytics', 'view'),

-- Admin - Most access but not system management
('admin', 'users', 'manage'),
('admin', 'collaborators', 'manage'),
('admin', 'commissions', 'manage'),
('admin', 'territories', 'manage'),
('admin', 'integrations', 'manage'),
('admin', 'workflows', 'manage'),
('admin', 'analytics', 'view'),

-- Regional Manager - Regional scope
('regional_manager', 'users', 'view'),
('regional_manager', 'collaborators', 'view'),
('regional_manager', 'commissions', 'view'),
('regional_manager', 'territories', 'view'),
('regional_manager', 'analytics', 'view'),

-- Sales Manager - Team management
('sales_manager', 'users', 'view'),
('sales_manager', 'collaborators', 'view'),
('sales_manager', 'commissions', 'view'),
('sales_manager', 'analytics', 'view'),

-- Sales Rep - Basic access
('sales_rep', 'collaborators', 'view'),
('sales_rep', 'commissions', 'view'),

-- Analyst - Analytics focus
('analyst', 'analytics', 'view'),
('analyst', 'users', 'view'),
('analyst', 'collaborators', 'view'),

-- Viewer - Read only
('viewer', 'users', 'view'),
('viewer', 'collaborators', 'view'),

-- Contractor - Limited time access
('contractor', 'collaborators', 'view');

-- Insert sample territories
INSERT INTO public.territories (name, description, territory_type, boundaries) VALUES
('Madrid Centro', 'Centro de Madrid y alrededores', 'geographic', '{"coordinates": [{"lat": 40.4168, "lng": -3.7038}], "radius": 25}'),
('Sector Tecnológico', 'Empresas de tecnología y software', 'sector', '{"industries": ["technology", "software", "fintech"]}'),
('Grandes Cuentas', 'Cuentas empresariales >50M facturación', 'account', '{"criteria": {"min_revenue": 50000000}}'),
('Barcelona Metropolitana', 'Área metropolitana de Barcelona', 'geographic', '{"coordinates": [{"lat": 41.3851, "lng": 2.1734}], "radius": 40}'),
('Sector Industrial', 'Manufactureras e industriales', 'sector', '{"industries": ["manufacturing", "industrial", "automotive"]}');

-- Insert sample integrations
INSERT INTO public.integration_marketplace (name, description, category, developer_name, version, pricing_model, configuration_schema, status) VALUES
('Salesforce Connector', 'Sincronización bidireccional con Salesforce CRM', 'CRM', 'Lovable Team', '2.1.0', 'paid', '{"api_key": {"type": "string", "required": true}, "instance_url": {"type": "string", "required": true}}', 'approved'),
('HubSpot Integration', 'Integración completa con HubSpot Marketing', 'Marketing', 'Lovable Team', '1.5.0', 'freemium', '{"api_key": {"type": "string", "required": true}}', 'approved'),
('Slack Notifications', 'Notificaciones automáticas en Slack', 'Communication', 'Lovable Team', '1.0.0', 'free', '{"webhook_url": {"type": "string", "required": true}}', 'approved'),
('Google Analytics', 'Tracking y analytics avanzado', 'Analytics', 'Google', '4.0.0', 'free', '{"tracking_id": {"type": "string", "required": true}}', 'approved'),
('Zapier Connect', 'Conexión con 5000+ aplicaciones vía Zapier', 'Automation', 'Zapier Inc.', '3.2.0', 'paid', '{"api_key": {"type": "string", "required": true}}', 'approved'),
('Microsoft Teams', 'Colaboración y notificaciones en Teams', 'Communication', 'Microsoft', '2.0.0', 'free', '{"webhook_url": {"type": "string", "required": true}}', 'approved'),
('DocuSign eSignature', 'Firma electrónica de documentos', 'Documents', 'DocuSign', '1.8.0', 'paid', '{"client_id": {"type": "string", "required": true}, "client_secret": {"type": "string", "required": true}}', 'approved');

-- Insert sample workflow templates
INSERT INTO public.workflow_templates (name, description, category, template_data, trigger_types, action_types, complexity_level, is_public) VALUES
('Lead Nurturing Sequence', 'Secuencia automática de nurturing para nuevos leads', 'Sales', '{"steps": [{"type": "wait", "duration": "1d"}, {"type": "email", "template": "welcome"}, {"type": "wait", "duration": "3d"}, {"type": "email", "template": "follow_up"}]}', '["lead_created"]', '["send_email", "create_task", "update_field"]', 'beginner', true),
('Deal Stage Automation', 'Automatización basada en cambios de stage de deals', 'Sales', '{"conditions": [{"field": "stage", "operator": "changed"}], "actions": [{"type": "notify_team"}, {"type": "update_probability"}]}', '["deal_updated"]', '["send_notification", "update_field", "create_activity"]', 'intermediate', true),
('Commission Calculation', 'Cálculo automático de comisiones al cerrar deals', 'Finance', '{"trigger": "deal_closed", "calculations": [{"type": "percentage", "rate": 0.05}]}', '["deal_closed"]', '["calculate_commission", "create_record", "notify_user"]', 'advanced', false),
('Territory Assignment', 'Asignación automática de territorio por geografía', 'Management', '{"rules": [{"condition": "company.location", "action": "assign_territory"}]}', '["lead_created", "company_updated"]', '["assign_territory", "notify_owner"]', 'intermediate', true),
('Onboarding Checklist', 'Lista automática de onboarding para nuevos usuarios', 'HR', '{"checklist": [{"task": "complete_profile"}, {"task": "first_call"}, {"task": "training_module"}]}', '["user_created"]', '["create_task", "send_email", "schedule_reminder"]', 'beginner', true);