-- Enable RLS on all new tables
ALTER TABLE public.collaborator_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_escrow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborator_territories ENABLE ROW LEVEL SECURITY;
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

-- RLS Policies for User Role Assignments
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