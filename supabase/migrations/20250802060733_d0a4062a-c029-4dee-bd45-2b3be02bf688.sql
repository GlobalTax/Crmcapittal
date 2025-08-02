-- Migración para Sistema de IA: Lead Persona Classification y Next Best Action
-- Extender tabla leads con campos de IA

-- 1. Agregar nuevos campos a la tabla leads para IA
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS next_best_action JSONB,
ADD COLUMN IF NOT EXISTS persona_confidence NUMERIC(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS last_ai_analysis TIMESTAMP WITH TIME ZONE;

-- 2. Extender tabla embeddings existente con columnas necesarias
ALTER TABLE public.embeddings 
ADD COLUMN IF NOT EXISTS entity_type TEXT,
ADD COLUMN IF NOT EXISTS entity_id UUID,
ADD COLUMN IF NOT EXISTS embedding_data VECTOR(1536),
ADD COLUMN IF NOT EXISTS embedding_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 3. Crear índices para búsquedas eficientes de embeddings
CREATE INDEX IF NOT EXISTS idx_embeddings_entity ON public.embeddings(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_cosine ON public.embeddings USING ivfflat (embedding_data vector_cosine_ops);

-- 4. Crear tabla para personas detectadas por IA
CREATE TABLE IF NOT EXISTS public.lead_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  characteristics JSONB DEFAULT '{}',
  typical_actions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Insertar tipos de personas predefinidas
INSERT INTO public.lead_personas (name, description, characteristics, typical_actions) VALUES
('CEO', 'Chief Executive Officer - Máximo decisor de la empresa', 
 '{"decision_power": "high", "urgency": "medium", "budget_authority": "high", "technical_knowledge": "low"}',
 '["schedule_meeting", "send_proposal", "call"]'
),
('CFO', 'Chief Financial Officer - Responsable financiero', 
 '{"decision_power": "high", "urgency": "low", "budget_authority": "high", "technical_knowledge": "medium"}',
 '["send_detailed_proposal", "schedule_financial_review", "email"]'
),
('Business Owner', 'Propietario del negocio - Decisor principal en PYME', 
 '{"decision_power": "high", "urgency": "high", "budget_authority": "high", "technical_knowledge": "medium"}',
 '["call", "schedule_meeting", "send_proposal"]'
),
('Investor', 'Inversor o fondo de inversión', 
 '{"decision_power": "high", "urgency": "medium", "budget_authority": "high", "technical_knowledge": "high"}',
 '["send_detailed_analysis", "schedule_meeting", "share_opportunities"]'
),
('Manager', 'Director o gerente de departamento', 
 '{"decision_power": "medium", "urgency": "medium", "budget_authority": "low", "technical_knowledge": "medium"}',
 '["nurture", "send_information", "schedule_call"]'
),
('Assistant', 'Asistente o coordinador', 
 '{"decision_power": "low", "urgency": "high", "budget_authority": "none", "technical_knowledge": "low"}',
 '["nurture", "send_information", "redirect_to_decision_maker"]'
),
('Consultant', 'Consultor o asesor externo', 
 '{"decision_power": "low", "urgency": "medium", "budget_authority": "none", "technical_knowledge": "high"}',
 '["build_relationship", "send_information", "schedule_call"]'
)
ON CONFLICT (name) DO NOTHING;

-- 6. Crear tabla para acciones recomendadas
CREATE TABLE IF NOT EXISTS public.next_best_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  priority_weight INTEGER DEFAULT 1,
  applicable_personas TEXT[] DEFAULT '{}',
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Insertar acciones predefinidas
INSERT INTO public.next_best_actions (action_type, display_name, description, priority_weight, applicable_personas, conditions) VALUES
('call', 'Llamada telefónica', 'Realizar llamada telefónica de seguimiento', 5, 
 '{"CEO", "Business Owner", "Manager"}', 
 '{"max_days_since_contact": 7, "min_lead_score": 60}'
),
('email', 'Enviar email', 'Enviar email personalizado de seguimiento', 3,
 '{"CFO", "Manager", "Consultant"}',
 '{"max_days_since_contact": 14, "min_lead_score": 30}'
),
('schedule_meeting', 'Agendar reunión', 'Proponer reunión presencial o virtual', 8,
 '{"CEO", "CFO", "Business Owner", "Investor"}',
 '{"min_lead_score": 70, "persona_confidence": 0.7}'
),
('send_proposal', 'Enviar propuesta', 'Enviar propuesta comercial personalizada', 10,
 '{"CEO", "CFO", "Business Owner", "Investor"}',
 '{"min_lead_score": 80, "stage": ["qualified", "proposal"]}'
),
('nurture', 'Nutrir lead', 'Continuar nutriendo con contenido relevante', 2,
 '{"Manager", "Assistant", "Consultant"}',
 '{"max_lead_score": 50}'
),
('send_information', 'Enviar información', 'Compartir material informativo relevante', 3,
 '{"Assistant", "Manager", "Consultant"}',
 '{"stage": ["new", "contacted"]}'
),
('redirect_to_decision_maker', 'Redirigir a decisor', 'Solicitar contacto del decisor principal', 6,
 '{"Assistant"}',
 '{"persona_confidence": 0.8}'
),
('share_opportunities', 'Compartir oportunidades', 'Mostrar oportunidades de inversión disponibles', 7,
 '{"Investor"}',
 '{"service_type": "investment"}'
)
ON CONFLICT (action_type) DO NOTHING;

-- 8. Trigger para actualizar updated_at en embeddings
CREATE OR REPLACE FUNCTION update_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_embeddings_updated_at_trigger
  BEFORE UPDATE ON public.embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_embeddings_updated_at();

-- 9. RLS policies para nuevas tablas
ALTER TABLE public.lead_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.next_best_actions ENABLE ROW LEVEL SECURITY;

-- Lead personas: Lectura pública, escritura solo admins
CREATE POLICY "Todos pueden ver lead personas" ON public.lead_personas FOR SELECT USING (true);
CREATE POLICY "Solo admins pueden gestionar lead personas" ON public.lead_personas 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- Next best actions: Lectura pública, escritura solo admins  
CREATE POLICY "Todos pueden ver next best actions" ON public.next_best_actions FOR SELECT USING (true);
CREATE POLICY "Solo admins pueden gestionar next best actions" ON public.next_best_actions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- 10. Comentarios para documentación
COMMENT ON COLUMN public.leads.aipersona IS 'JSONB con información de la persona detectada por IA: {"type": "CEO", "confidence": 0.85, "reasoning": "..."}';
COMMENT ON COLUMN public.leads.next_best_action IS 'JSONB con recomendaciones de IA: {"recommended_actions": [{"action": "call", "priority": 8, "reasoning": "..."}]}';
COMMENT ON COLUMN public.leads.persona_confidence IS 'Nivel de confianza (0.0-1.0) en la clasificación de persona';
COMMENT ON COLUMN public.leads.last_ai_analysis IS 'Timestamp del último análisis de IA realizado';

COMMENT ON TABLE public.embeddings IS 'Almacena embeddings de OpenAI para búsquedas de similitud';
COMMENT ON TABLE public.lead_personas IS 'Tipos de personas que pueden ser detectadas por IA';
COMMENT ON TABLE public.next_best_actions IS 'Acciones recomendadas que puede sugerir la IA';