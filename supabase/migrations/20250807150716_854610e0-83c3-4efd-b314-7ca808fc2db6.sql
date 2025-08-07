-- Mejoras para Time Tracking Profesional

-- 1. Tabla para categorías de actividades
CREATE TABLE IF NOT EXISTS public.activity_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  is_billable_by_default BOOLEAN DEFAULT false,
  default_hourly_rate DECIMAL(10,2),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Tabla para rates por proyecto/cliente
CREATE TABLE IF NOT EXISTS public.project_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lead', 'mandate', 'contact', 'company')),
  entity_id UUID NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  is_active BOOLEAN DEFAULT true,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Tabla para configuración de productividad
CREATE TABLE IF NOT EXISTS public.productivity_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  break_reminder_interval INTEGER DEFAULT 90, -- minutos
  daily_hours_target INTEGER DEFAULT 8,
  productivity_tracking_enabled BOOLEAN DEFAULT true,
  auto_categorization_enabled BOOLEAN DEFAULT true,
  smart_suggestions_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 4. Tabla para smart suggestions de actividades
CREATE TABLE IF NOT EXISTS public.activity_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  suggested_activity TEXT NOT NULL,
  context_entity_type TEXT,
  context_entity_id UUID,
  confidence_score DECIMAL(3,2) DEFAULT 0.8,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed')),
  suggested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- 5. Tabla para patrones de productividad
CREATE TABLE IF NOT EXISTS public.productivity_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('peak_hours', 'break_optimal', 'activity_preference')),
  pattern_data JSONB NOT NULL,
  confidence_level DECIMAL(3,2) DEFAULT 0.5,
  data_points_count INTEGER DEFAULT 0,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Tabla para time tracking analytics
CREATE TABLE IF NOT EXISTS public.time_tracking_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date DATE NOT NULL,
  total_minutes INTEGER DEFAULT 0,
  billable_minutes INTEGER DEFAULT 0,
  productive_minutes INTEGER DEFAULT 0,
  break_minutes INTEGER DEFAULT 0,
  activities_count INTEGER DEFAULT 0,
  focus_score DECIMAL(3,2) DEFAULT 0.0,
  efficiency_score DECIMAL(3,2) DEFAULT 0.0,
  revenue_generated DECIMAL(10,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- 7. Tabla para approval workflows
CREATE TABLE IF NOT EXISTS public.time_entry_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  time_entry_id UUID NOT NULL REFERENCES public.time_entries(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_required')),
  comments TEXT,
  approved_amount DECIMAL(10,2),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Mejorar tabla time_entries existente
ALTER TABLE public.time_entries 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.activity_categories(id),
ADD COLUMN IF NOT EXISTS project_rate_id UUID REFERENCES public.project_rates(id),
ADD COLUMN IF NOT EXISTS break_type TEXT CHECK (break_type IN ('short', 'long', 'lunch')),
ADD COLUMN IF NOT EXISTS focus_score DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS interruptions_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_categorized BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'draft' CHECK (billing_status IN ('draft', 'submitted', 'approved', 'billed', 'paid')),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Insertar categorías por defecto
INSERT INTO public.activity_categories (name, color, is_billable_by_default, description) VALUES
('Llamadas Comerciales', '#22c55e', true, 'Llamadas con prospects y clientes'),
('Emails', '#3b82f6', true, 'Comunicación por email'),
('Reuniones Cliente', '#8b5cf6', true, 'Reuniones presenciales o virtuales con clientes'),
('Preparación Propuestas', '#f59e0b', true, 'Preparación de documentos y propuestas'),
('Investigación', '#06b6d4', true, 'Investigación de mercado y companies'),
('Administración', '#6b7280', false, 'Tareas administrativas internas'),
('Formación', '#ec4899', false, 'Actividades de formación y desarrollo'),
('Networking', '#10b981', true, 'Eventos y actividades de networking'),
('Seguimiento', '#f97316', true, 'Seguimiento post-venta y relación cliente'),
('Análisis', '#8b5cf6', true, 'Análisis de datos y reportes');

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_time_entries_category_id ON public.time_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_billing_status ON public.time_entries(billing_status);
CREATE INDEX IF NOT EXISTS idx_time_entries_tags ON public.time_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_time_tracking_analytics_user_date ON public.time_tracking_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_productivity_patterns_user_type ON public.productivity_patterns(user_id, pattern_type);
CREATE INDEX IF NOT EXISTS idx_project_rates_entity ON public.project_rates(entity_type, entity_id);

-- RLS Policies
ALTER TABLE public.activity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_tracking_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entry_approvals ENABLE ROW LEVEL SECURITY;

-- Policies para activity_categories (todos pueden leer, solo admins modificar)
CREATE POLICY "Usuarios pueden ver categorías de actividad" ON public.activity_categories
  FOR SELECT USING (true);

CREATE POLICY "Solo admins pueden gestionar categorías" ON public.activity_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Policies para project_rates
CREATE POLICY "Usuarios pueden ver rates de sus proyectos" ON public.project_rates
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Usuarios pueden crear rates" ON public.project_rates
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios pueden actualizar sus rates" ON public.project_rates
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Policies para configuración personal
CREATE POLICY "Usuarios pueden gestionar su configuración" ON public.productivity_settings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden gestionar sus sugerencias" ON public.activity_suggestions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden gestionar sus patrones" ON public.productivity_patterns
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden gestionar sus analytics" ON public.time_tracking_analytics
  FOR ALL USING (user_id = auth.uid());

-- Policies para approvals
CREATE POLICY "Usuarios pueden ver sus approvals" ON public.time_entry_approvals
  FOR SELECT USING (
    requested_by = auth.uid() OR 
    approver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Usuarios pueden crear approvals" ON public.time_entry_approvals
  FOR INSERT WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Aprobadores pueden actualizar approvals" ON public.time_entry_approvals
  FOR UPDATE USING (
    approver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at_time_tracking()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activity_categories_updated_at
  BEFORE UPDATE ON public.activity_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_time_tracking();

CREATE TRIGGER update_project_rates_updated_at
  BEFORE UPDATE ON public.project_rates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_time_tracking();

CREATE TRIGGER update_productivity_settings_updated_at
  BEFORE UPDATE ON public.productivity_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_time_tracking();

CREATE TRIGGER update_productivity_patterns_updated_at
  BEFORE UPDATE ON public.productivity_patterns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_time_tracking();

CREATE TRIGGER update_time_tracking_analytics_updated_at
  BEFORE UPDATE ON public.time_tracking_analytics
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_time_tracking();

CREATE TRIGGER update_time_entry_approvals_updated_at
  BEFORE UPDATE ON public.time_entry_approvals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_time_tracking();