-- Fase 1.3: Insertar permisos base y asignar por roles

-- 1. Insertar permisos básicos por módulo
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

-- 2. Asignar permisos por roles

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