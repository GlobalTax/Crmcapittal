-- Crear tipo enterprise_role para el sistema de roles avanzado
CREATE TYPE public.enterprise_role AS ENUM (
  'superadmin', 'admin', 'regional_manager', 'sales_manager', 
  'sales_rep', 'analyst', 'viewer', 'contractor'
);

-- Insertar datos iniciales de sample para territorios
INSERT INTO public.territories (name, description, territory_type, boundaries) VALUES
('Madrid Centro', 'Centro de Madrid y alrededores', 'geographic', '{"coordinates": [{"lat": 40.4168, "lng": -3.7038}], "radius": 25}'),
('Sector Tecnológico', 'Empresas de tecnología y software', 'sector', '{"industries": ["technology", "software", "fintech"]}'),
('Grandes Cuentas', 'Cuentas empresariales >50M facturación', 'account', '{"criteria": {"min_revenue": 50000000}}'),
('Barcelona Metropolitana', 'Área metropolitana de Barcelona', 'geographic', '{"coordinates": [{"lat": 41.3851, "lng": 2.1734}], "radius": 40}'),
('Sector Industrial', 'Manufactureras e industriales', 'sector', '{"industries": ["manufacturing", "industrial", "automotive"]}');

-- Insertar sample integrations para el marketplace
INSERT INTO public.integration_marketplace (name, description, category, developer_name, version, pricing_model, configuration_schema, status) VALUES
('Salesforce Connector', 'Sincronización bidireccional con Salesforce CRM', 'CRM', 'Lovable Team', '2.1.0', 'paid', '{"api_key": {"type": "string", "required": true}, "instance_url": {"type": "string", "required": true}}', 'approved'),
('HubSpot Integration', 'Integración completa con HubSpot Marketing', 'Marketing', 'Lovable Team', '1.5.0', 'freemium', '{"api_key": {"type": "string", "required": true}}', 'approved'),
('Slack Notifications', 'Notificaciones automáticas en Slack', 'Communication', 'Lovable Team', '1.0.0', 'free', '{"webhook_url": {"type": "string", "required": true}}', 'approved'),
('Google Analytics', 'Tracking y analytics avanzado', 'Analytics', 'Google', '4.0.0', 'free', '{"tracking_id": {"type": "string", "required": true}}', 'approved'),
('Zapier Connect', 'Conexión con 5000+ aplicaciones vía Zapier', 'Automation', 'Zapier Inc.', '3.2.0', 'paid', '{"api_key": {"type": "string", "required": true}}', 'approved'),
('Microsoft Teams', 'Colaboración y notificaciones en Teams', 'Communication', 'Microsoft', '2.0.0', 'free', '{"webhook_url": {"type": "string", "required": true}}', 'approved'),
('DocuSign eSignature', 'Firma electrónica de documentos', 'Documents', 'DocuSign', '1.8.0', 'paid', '{"client_id": {"type": "string", "required": true}, "client_secret": {"type": "string", "required": true}}', 'approved');

-- Insertar sample workflow templates
INSERT INTO public.workflow_templates (name, description, category, template_data, trigger_types, action_types, complexity_level, is_public) VALUES
('Lead Nurturing Sequence', 'Secuencia automática de nurturing para nuevos leads', 'Sales', '{"steps": [{"type": "wait", "duration": "1d"}, {"type": "email", "template": "welcome"}, {"type": "wait", "duration": "3d"}, {"type": "email", "template": "follow_up"}]}', '["lead_created"]', '["send_email", "create_task", "update_field"]', 'beginner', true),
('Deal Stage Automation', 'Automatización basada en cambios de stage de deals', 'Sales', '{"conditions": [{"field": "stage", "operator": "changed"}], "actions": [{"type": "notify_team"}, {"type": "update_probability"}]}', '["deal_updated"]', '["send_notification", "update_field", "create_activity"]', 'intermediate', true),
('Commission Calculation', 'Cálculo automático de comisiones al cerrar deals', 'Finance', '{"trigger": "deal_closed", "calculations": [{"type": "percentage", "rate": 0.05}]}', '["deal_closed"]', '["calculate_commission", "create_record", "notify_user"]', 'advanced', false),
('Territory Assignment', 'Asignación automática de territorio por geografía', 'Management', '{"rules": [{"condition": "company.location", "action": "assign_territory"}]}', '["lead_created", "company_updated"]', '["assign_territory", "notify_owner"]', 'intermediate', true),
('Onboarding Checklist', 'Lista automática de onboarding para nuevos usuarios', 'HR', '{"checklist": [{"task": "complete_profile"}, {"task": "first_call"}, {"task": "training_module"}]}', '["user_created"]', '["create_task", "send_email", "schedule_reminder"]', 'beginner', true);