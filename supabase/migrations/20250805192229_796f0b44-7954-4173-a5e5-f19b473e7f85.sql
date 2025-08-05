-- Fase 1: Expandir enum de roles y crear sistema de permisos granulares

-- 1. Expandir enum de roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales_rep';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'marketing';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support';

-- 2. Crear tabla de permisos
CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  module text NOT NULL, -- companies, contacts, leads, operations, etc.
  action text NOT NULL, -- create, read, update, delete, manage
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Crear tabla de relación roles-permisos
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- 4. Habilitar RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para permisos (solo admins pueden gestionar)
CREATE POLICY "Admin users can manage permissions" ON public.permissions
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = ANY(ARRAY['admin'::app_role, 'superadmin'::app_role]))
);

CREATE POLICY "Admin users can manage role permissions" ON public.role_permissions
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = ANY(ARRAY['admin'::app_role, 'superadmin'::app_role]))
);

-- 6. Insertar permisos básicos por módulo
INSERT INTO public.permissions (name, description, module, action) VALUES
-- Empresas
('companies.create', 'Crear empresas', 'companies', 'create'),
('companies.read', 'Ver empresas', 'companies', 'read'),
('companies.update', 'Editar empresas', 'companies', 'update'),
('companies.delete', 'Eliminar empresas', 'companies', 'delete'),
('companies.manage_all', 'Gestionar todas las empresas', 'companies', 'manage'),

-- Contactos
('contacts.create', 'Crear contactos', 'contacts', 'create'),
('contacts.read', 'Ver contactos', 'contacts', 'read'),
('contacts.update', 'Editar contactos', 'contacts', 'update'),
('contacts.delete', 'Eliminar contactos', 'contacts', 'delete'),
('contacts.manage_all', 'Gestionar todos los contactos', 'contacts', 'manage'),

-- Leads
('leads.create', 'Crear leads', 'leads', 'create'),
('leads.read', 'Ver leads', 'leads', 'read'),
('leads.update', 'Editar leads', 'leads', 'update'),
('leads.delete', 'Eliminar leads', 'leads', 'delete'),
('leads.manage_all', 'Gestionar todos los leads', 'leads', 'manage'),
('leads.assign', 'Asignar leads', 'leads', 'assign'),

-- Operaciones
('operations.create', 'Crear operaciones', 'operations', 'create'),
('operations.read', 'Ver operaciones', 'operations', 'read'),
('operations.update', 'Editar operaciones', 'operations', 'update'),
('operations.delete', 'Eliminar operaciones', 'operations', 'delete'),
('operations.manage_all', 'Gestionar todas las operaciones', 'operations', 'manage'),

-- Comisiones
('commissions.create', 'Crear comisiones', 'commissions', 'create'),
('commissions.read', 'Ver comisiones', 'commissions', 'read'),
('commissions.update', 'Editar comisiones', 'commissions', 'update'),
('commissions.delete', 'Eliminar comisiones', 'commissions', 'delete'),
('commissions.approve', 'Aprobar comisiones', 'commissions', 'approve'),
('commissions.pay', 'Pagar comisiones', 'commissions', 'pay'),

-- Usuarios y roles
('users.create', 'Crear usuarios', 'users', 'create'),
('users.read', 'Ver usuarios', 'users', 'read'),
('users.update', 'Editar usuarios', 'users', 'update'),
('users.delete', 'Eliminar usuarios', 'users', 'delete'),
('users.manage_roles', 'Gestionar roles de usuarios', 'users', 'manage_roles'),

-- Sistema
('system.analytics', 'Ver analytics del sistema', 'system', 'read'),
('system.settings', 'Configurar sistema', 'system', 'manage'),
('system.audit', 'Ver logs de auditoría', 'system', 'audit')

ON CONFLICT (name) DO NOTHING;

-- 7. Asignar permisos por roles
-- SUPERADMIN: Todos los permisos
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'superadmin'::app_role, id FROM public.permissions
ON CONFLICT DO NOTHING;

-- ADMIN: Casi todos excepto gestión de superadmins
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin'::app_role, id FROM public.permissions
WHERE name NOT IN ('system.settings')
ON CONFLICT DO NOTHING;

-- MANAGER: Gestión de su equipo y datos
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager'::app_role, id FROM public.permissions
WHERE name IN (
  'companies.create', 'companies.read', 'companies.update', 'companies.manage_all',
  'contacts.create', 'contacts.read', 'contacts.update', 'contacts.manage_all',
  'leads.create', 'leads.read', 'leads.update', 'leads.assign', 'leads.manage_all',
  'operations.create', 'operations.read', 'operations.update', 'operations.manage_all',
  'commissions.read', 'commissions.create', 'commissions.update',
  'users.read', 'system.analytics'
)
ON CONFLICT DO NOTHING;

-- SALES_REP: Enfocado en ventas
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'sales_rep'::app_role, id FROM public.permissions
WHERE name IN (
  'companies.create', 'companies.read', 'companies.update',
  'contacts.create', 'contacts.read', 'contacts.update',
  'leads.create', 'leads.read', 'leads.update',
  'operations.create', 'operations.read', 'operations.update',
  'commissions.read'
)
ON CONFLICT DO NOTHING;

-- MARKETING: Enfocado en marketing y leads
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'marketing'::app_role, id FROM public.permissions
WHERE name IN (
  'companies.read', 'companies.update',
  'contacts.create', 'contacts.read', 'contacts.update',
  'leads.create', 'leads.read', 'leads.update', 'leads.manage_all',
  'system.analytics'
)
ON CONFLICT DO NOTHING;

-- SUPPORT: Soporte y lectura
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'support'::app_role, id FROM public.permissions
WHERE name IN (
  'companies.read', 'contacts.read', 'leads.read', 'operations.read',
  'users.read'
)
ON CONFLICT DO NOTHING;

-- USER: Permisos básicos solo sus datos
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'user'::app_role, id FROM public.permissions
WHERE name IN (
  'companies.create', 'companies.read', 'companies.update',
  'contacts.create', 'contacts.read', 'contacts.update',
  'leads.create', 'leads.read', 'leads.update',
  'operations.create', 'operations.read', 'operations.update',
  'commissions.read'
)
ON CONFLICT DO NOTHING;

-- 8. Función para verificar permisos granulares
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id
      AND p.name = _permission_name
  )
$$;

-- 9. Función para obtener permisos de un usuario
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS TABLE(permission_name text, module text, action text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT p.name, p.module, p.action
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = _user_id
  ORDER BY p.module, p.action
$$;

-- 10. Función mejorada para verificar si tiene rol (con jerarquía)
CREATE OR REPLACE FUNCTION public.has_role_secure(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        role = _role OR
        -- Jerarquía: superadmin puede todo
        (role = 'superadmin' AND _role IN ('admin', 'manager', 'sales_rep', 'marketing', 'support', 'user')) OR
        -- Admin puede roles menores
        (role = 'admin' AND _role IN ('manager', 'sales_rep', 'marketing', 'support', 'user')) OR
        -- Manager puede roles de equipo
        (role = 'manager' AND _role IN ('sales_rep', 'marketing', 'support', 'user'))
      )
  )
$$;