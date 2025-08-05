-- Crear tabla de configuración de visibilidad de campos
CREATE TABLE public.field_visibility_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  field_name text NOT NULL,
  role app_role NOT NULL,
  is_visible boolean DEFAULT true,
  is_editable boolean DEFAULT false,
  mask_type text DEFAULT 'none', -- 'partial', 'full', 'none'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(table_name, field_name, role)
);

-- Habilitar RLS
ALTER TABLE public.field_visibility_config ENABLE ROW LEVEL SECURITY;

-- Solo superadmins pueden gestionar la configuración de visibilidad
CREATE POLICY "Solo superadmins pueden gestionar configuración de visibilidad"
ON public.field_visibility_config
FOR ALL
TO authenticated
USING (has_role_secure(auth.uid(), 'superadmin'));

-- Insertar configuración por defecto para la tabla collaborators
INSERT INTO public.field_visibility_config (table_name, field_name, role, is_visible, is_editable, mask_type) VALUES
-- Superadmin ve todo
('collaborators', 'commission_percentage', 'superadmin', true, true, 'none'),
('collaborators', 'base_commission', 'superadmin', true, true, 'none'),
('collaborators', 'email', 'superadmin', true, true, 'none'),
('collaborators', 'phone', 'superadmin', true, true, 'none'),
('collaborators', 'notes', 'superadmin', true, true, 'none'),
('collaborators', 'agreement_status', 'superadmin', true, true, 'none'),

-- Admin ve datos básicos
('collaborators', 'commission_percentage', 'admin', true, false, 'none'),
('collaborators', 'base_commission', 'admin', false, false, 'full'),
('collaborators', 'email', 'admin', true, false, 'none'),
('collaborators', 'phone', 'admin', true, false, 'partial'),
('collaborators', 'notes', 'admin', true, false, 'none'),
('collaborators', 'agreement_status', 'admin', true, false, 'none'),

-- User solo ve información básica
('collaborators', 'commission_percentage', 'user', false, false, 'full'),
('collaborators', 'base_commission', 'user', false, false, 'full'),
('collaborators', 'email', 'user', false, false, 'full'),
('collaborators', 'phone', 'user', false, false, 'full'),
('collaborators', 'notes', 'user', false, false, 'full'),
('collaborators', 'agreement_status', 'user', true, false, 'none');

-- Trigger para updated_at
CREATE TRIGGER update_field_visibility_config_updated_at
    BEFORE UPDATE ON public.field_visibility_config
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();