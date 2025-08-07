-- Completar tablas restantes para Administración Empresarial

-- ===== FASE B: ROLES & USUARIOS EMPRESARIAL =====

-- 1. User Role Assignments (nueva tabla para el nuevo sistema)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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
  api_credentials JSONB DEFAULT '{}',
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
  api_key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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

-- Create indexes for performance
CREATE INDEX idx_enhanced_audit_logs_user_id_created_at ON public.enhanced_audit_logs(user_id, created_at);
CREATE INDEX idx_enhanced_audit_logs_action_type_created_at ON public.enhanced_audit_logs(action_type, created_at);
CREATE INDEX idx_enhanced_audit_logs_risk_level_created_at ON public.enhanced_audit_logs(risk_level, created_at);
CREATE INDEX idx_api_usage_logs_api_key_id_created_at ON public.api_usage_logs(api_key_id, created_at);
CREATE INDEX idx_api_usage_logs_endpoint_created_at ON public.api_usage_logs(endpoint, created_at);
CREATE INDEX idx_system_metrics_type_name_collected_at ON public.system_metrics(metric_type, metric_name, collected_at);
CREATE INDEX idx_system_metrics_collected_at ON public.system_metrics(collected_at);
CREATE INDEX idx_user_activity_heatmaps_user_id_created_at ON public.user_activity_heatmaps(user_id, created_at);
CREATE INDEX idx_user_activity_heatmaps_page_path_created_at ON public.user_activity_heatmaps(page_path, created_at);