-- Insertar acciones mínimas para cada etapa del pipeline

-- ETAPA 1: New Lead (dad77441-1018-4019-8779-bee5f08aff28)
INSERT INTO public.stage_actions (stage_id, action_type, action_name, action_config, is_required, order_index, is_active) VALUES
('dad77441-1018-4019-8779-bee5f08aff28', 'automatic', 'Enviar email de bienvenida', 
 '{"email_template_id": null, "notification_message": "Email de bienvenida enviado automáticamente", "delay_minutes": 5}'::jsonb, 
 true, 1, true),
('dad77441-1018-4019-8779-bee5f08aff28', 'manual', 'Realizar primera llamada', 
 '{"button_text": "Llamar Lead", "button_color": "primary", "confirmation_message": "¿Confirmas que has realizado la llamada?", "success_message": "Primera llamada registrada exitosamente"}'::jsonb, 
 true, 2, true),
('dad77441-1018-4019-8779-bee5f08aff28', 'validation', 'Verificar datos de contacto', 
 '{"required_fields": ["email", "phone"], "error_message": "Debe completar email y teléfono antes de avanzar"}'::jsonb, 
 true, 3, true);

-- ETAPA 2: Cualificado (8cf9a05f-2d6e-402f-a433-1b9078be9d09)
INSERT INTO public.stage_actions (stage_id, action_type, action_name, action_config, is_required, order_index, is_active) VALUES
('8cf9a05f-2d6e-402f-a433-1b9078be9d09', 'manual', 'Agendar reunión de cualificación', 
 '{"button_text": "Agendar Reunión", "button_color": "primary", "confirmation_message": "¿Has agendado la reunión de cualificación?", "success_message": "Reunión agendada correctamente"}'::jsonb, 
 true, 1, true),
('8cf9a05f-2d6e-402f-a433-1b9078be9d09', 'validation', 'Confirmar presupuesto y necesidades', 
 '{"required_fields": ["budget_range", "service_type"], "error_message": "Debe confirmar presupuesto y tipo de servicio antes de avanzar"}'::jsonb, 
 true, 2, true);

-- ETAPA 3: Propuesta (6b9581a9-3d6c-4b11-980b-2a713d14ad80)
INSERT INTO public.stage_actions (stage_id, action_type, action_name, action_config, is_required, order_index, is_active) VALUES
('6b9581a9-3d6c-4b11-980b-2a713d14ad80', 'manual', 'Enviar propuesta comercial', 
 '{"button_text": "Enviar Propuesta", "button_color": "primary", "confirmation_message": "¿Confirmas que has enviado la propuesta?", "success_message": "Propuesta enviada correctamente"}'::jsonb, 
 true, 1, true),
('6b9581a9-3d6c-4b11-980b-2a713d14ad80', 'automatic', 'Programar seguimiento en 3 días', 
 '{"task_type": "follow_up", "task_description": "Hacer seguimiento de propuesta enviada", "delay_minutes": 4320}'::jsonb, 
 false, 2, true),
('6b9581a9-3d6c-4b11-980b-2a713d14ad80', 'validation', 'Confirmar recepción de propuesta', 
 '{"required_fields": ["proposal_sent_date"], "error_message": "Debe confirmar el envío de la propuesta antes de avanzar"}'::jsonb, 
 true, 3, true);

-- ETAPA 4: Negociación (38ecbd48-44bb-4cfe-b84d-e18812d30751)
INSERT INTO public.stage_actions (stage_id, action_type, action_name, action_config, is_required, order_index, is_active) VALUES
('38ecbd48-44bb-4cfe-b84d-e18812d30751', 'manual', 'Revisar y ajustar términos', 
 '{"button_text": "Revisar Términos", "button_color": "warning", "confirmation_message": "¿Has revisado los términos con el cliente?", "success_message": "Términos revisados correctamente"}'::jsonb, 
 true, 1, true),
('38ecbd48-44bb-4cfe-b84d-e18812d30751', 'manual', 'Agendar reunión de negociación', 
 '{"button_text": "Agendar Negociación", "button_color": "primary", "confirmation_message": "¿Has agendado la reunión de negociación?", "success_message": "Reunión de negociación agendada"}'::jsonb, 
 false, 2, true),
('38ecbd48-44bb-4cfe-b84d-e18812d30751', 'validation', 'Verificar decisores involucrados', 
 '{"required_fields": ["decision_makers"], "error_message": "Debe identificar a los decisores antes de avanzar"}'::jsonb, 
 true, 3, true);

-- ETAPA 5: Ganado (5a34082e-d318-455f-b676-445b1b36260f)
INSERT INTO public.stage_actions (stage_id, action_type, action_name, action_config, is_required, order_index, is_active) VALUES
('5a34082e-d318-455f-b676-445b1b36260f', 'automatic', 'Enviar felicitación al cliente', 
 '{"email_template_id": null, "notification_message": "Email de felicitación enviado automáticamente", "delay_minutes": 1}'::jsonb, 
 false, 1, true),
('5a34082e-d318-455f-b676-445b1b36260f', 'manual', 'Iniciar proceso de onboarding', 
 '{"button_text": "Iniciar Onboarding", "button_color": "success", "confirmation_message": "¿Has iniciado el proceso de onboarding?", "success_message": "Proceso de onboarding iniciado"}'::jsonb, 
 true, 2, true),
('5a34082e-d318-455f-b676-445b1b36260f', 'automatic', 'Notificar al equipo de éxito', 
 '{"notification_message": "Nuevo cliente ganado - notificar al equipo de éxito", "delay_minutes": 5}'::jsonb, 
 false, 3, true);

-- ETAPA 6: Perdido (38c7644e-d2fd-4ba6-8042-a6957faf1283)
INSERT INTO public.stage_actions (stage_id, action_type, action_name, action_config, is_required, order_index, is_active) VALUES
('38c7644e-d2fd-4ba6-8042-a6957faf1283', 'manual', 'Registrar motivo de pérdida', 
 '{"button_text": "Registrar Motivo", "button_color": "destructive", "confirmation_message": "¿Has registrado el motivo de pérdida?", "success_message": "Motivo de pérdida registrado"}'::jsonb, 
 true, 1, true),
('38c7644e-d2fd-4ba6-8042-a6957faf1283', 'automatic', 'Añadir a campaña de nurturing', 
 '{"notification_message": "Lead añadido a campaña de nurturing automáticamente", "delay_minutes": 10}'::jsonb, 
 false, 2, true),
('38c7644e-d2fd-4ba6-8042-a6957faf1283', 'manual', 'Programar seguimiento futuro', 
 '{"button_text": "Programar Seguimiento", "button_color": "secondary", "confirmation_message": "¿Has programado un seguimiento futuro?", "success_message": "Seguimiento futuro programado"}'::jsonb, 
 false, 3, true);