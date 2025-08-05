-- Fase 1.2: Crear tablas de permisos y sistema granular

-- 1. Crear tabla de permisos
CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  module text NOT NULL, -- companies, contacts, leads, operations, etc.
  action text NOT NULL, -- create, read, update, delete, manage
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Crear tabla de relación roles-permisos
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- 3. Habilitar RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para permisos (solo admins pueden gestionar)
CREATE POLICY "Admin users can manage permissions" ON public.permissions
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = ANY(ARRAY['admin'::app_role, 'superadmin'::app_role]))
);

CREATE POLICY "Admin users can manage role permissions" ON public.role_permissions
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = ANY(ARRAY['admin'::app_role, 'superadmin'::app_role]))
);

-- 5. Función para verificar permisos granulares
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

-- 6. Función para obtener permisos de un usuario
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

-- 7. Función mejorada para verificar si tiene rol (con jerarquía)
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