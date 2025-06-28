
-- Fase 1: Enriquecer la Base de Datos

-- Expandir la tabla de contactos con campos adicionales
ALTER TABLE public.contacts 
ADD COLUMN linkedin_url TEXT,
ADD COLUMN website_url TEXT,
ADD COLUMN preferred_contact_method TEXT DEFAULT 'email',
ADD COLUMN investment_capacity_min BIGINT,
ADD COLUMN investment_capacity_max BIGINT,
ADD COLUMN sectors_of_interest TEXT[],
ADD COLUMN deal_preferences JSONB,
ADD COLUMN contact_source TEXT,
ADD COLUMN last_interaction_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN contact_priority TEXT DEFAULT 'medium',
ADD COLUMN is_active BOOLEAN DEFAULT true,
ADD COLUMN time_zone TEXT,
ADD COLUMN language_preference TEXT DEFAULT 'es';

-- Crear tabla para información detallada de empresas de contactos
CREATE TABLE public.contact_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_website TEXT,
  company_linkedin TEXT,
  company_size TEXT,
  company_revenue BIGINT,
  company_sector TEXT,
  company_location TEXT,
  company_description TEXT,
  founded_year INTEGER,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para etiquetas flexibles
CREATE TABLE public.contact_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3B82F6',
  description TEXT,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de relación entre contactos y tags
CREATE TABLE public.contact_tag_relations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.contact_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contact_id, tag_id)
);

-- Crear tabla para tracking completo de interacciones
CREATE TABLE public.contact_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'email', 'call', 'meeting', 'linkedin', 'whatsapp', etc.
  interaction_method TEXT, -- 'inbound', 'outbound'
  subject TEXT,
  description TEXT,
  outcome TEXT, -- 'positive', 'negative', 'neutral', 'follow_up_needed'
  next_action TEXT,
  next_action_date TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  location TEXT,
  attendees JSONB,
  documents_shared TEXT[],
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  interaction_date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para recordatorios y follow-ups
CREATE TABLE public.contact_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_type TEXT DEFAULT 'follow_up', -- 'follow_up', 'birthday', 'meeting', 'deadline'
  is_completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Crear tabla para templates de comunicación
CREATE TABLE public.communication_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL, -- 'email', 'linkedin', 'proposal', 'follow_up'
  subject TEXT,
  content TEXT NOT NULL,
  variables JSONB, -- Variables que se pueden personalizar en el template
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las nuevas tablas
ALTER TABLE public.contact_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para contact_companies
CREATE POLICY "Users can view all contact companies" ON public.contact_companies FOR SELECT USING (true);
CREATE POLICY "Users can create contact companies" ON public.contact_companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update contact companies" ON public.contact_companies FOR UPDATE USING (true);
CREATE POLICY "Users can delete contact companies" ON public.contact_companies FOR DELETE USING (true);

-- Crear políticas RLS para contact_tags
CREATE POLICY "Users can view all contact tags" ON public.contact_tags FOR SELECT USING (true);
CREATE POLICY "Users can create contact tags" ON public.contact_tags FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own contact tags" ON public.contact_tags FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own contact tags" ON public.contact_tags FOR DELETE USING (auth.uid() = created_by);

-- Crear políticas RLS para contact_tag_relations
CREATE POLICY "Users can view all contact tag relations" ON public.contact_tag_relations FOR SELECT USING (true);
CREATE POLICY "Users can manage contact tag relations" ON public.contact_tag_relations FOR ALL USING (true);

-- Crear políticas RLS para contact_interactions
CREATE POLICY "Users can view all contact interactions" ON public.contact_interactions FOR SELECT USING (true);
CREATE POLICY "Users can create contact interactions" ON public.contact_interactions FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own contact interactions" ON public.contact_interactions FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own contact interactions" ON public.contact_interactions FOR DELETE USING (auth.uid() = created_by);

-- Crear políticas RLS para contact_reminders
CREATE POLICY "Users can view all contact reminders" ON public.contact_reminders FOR SELECT USING (true);
CREATE POLICY "Users can create contact reminders" ON public.contact_reminders FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own contact reminders" ON public.contact_reminders FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own contact reminders" ON public.contact_reminders FOR DELETE USING (auth.uid() = created_by);

-- Crear políticas RLS para communication_templates
CREATE POLICY "Users can view all communication templates" ON public.communication_templates FOR SELECT USING (true);
CREATE POLICY "Users can create communication templates" ON public.communication_templates FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own communication templates" ON public.communication_templates FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own communication templates" ON public.communication_templates FOR DELETE USING (auth.uid() = created_by);

-- Añadir triggers para updated_at
CREATE TRIGGER update_contact_companies_updated_at 
  BEFORE UPDATE ON public.contact_companies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_templates_updated_at 
  BEFORE UPDATE ON public.communication_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar last_interaction_date automáticamente
CREATE OR REPLACE FUNCTION update_contact_last_interaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.contacts 
  SET last_interaction_date = NEW.interaction_date
  WHERE id = NEW.contact_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar last_interaction_date
CREATE TRIGGER update_contact_last_interaction_trigger
  AFTER INSERT ON public.contact_interactions
  FOR EACH ROW EXECUTE FUNCTION update_contact_last_interaction();

-- Índices para mejorar rendimiento
CREATE INDEX idx_contacts_last_interaction ON public.contacts(last_interaction_date);
CREATE INDEX idx_contacts_priority ON public.contacts(contact_priority);
CREATE INDEX idx_contacts_active ON public.contacts(is_active);
CREATE INDEX idx_contact_interactions_date ON public.contact_interactions(interaction_date);
CREATE INDEX idx_contact_interactions_type ON public.contact_interactions(interaction_type);
CREATE INDEX idx_contact_reminders_date ON public.contact_reminders(reminder_date);
CREATE INDEX idx_contact_reminders_completed ON public.contact_reminders(is_completed);
