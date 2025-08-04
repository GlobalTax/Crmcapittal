-- FASE 1B: Corregir estructura de user_profiles para usar user_id correctamente

-- Agregar columna user_id si no existe
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Migrar datos existentes: copiar id a user_id para mantener referencias
UPDATE public.user_profiles 
SET user_id = id 
WHERE user_id IS NULL;

-- Hacer user_id NOT NULL y único
ALTER TABLE public.user_profiles 
ALTER COLUMN user_id SET NOT NULL;

-- Crear índice único en user_id
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_user_id_key ON public.user_profiles(user_id);

-- Ahora crear las políticas RLS correctas usando user_id
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;

CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.user_profiles
FOR SELECT
USING (has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Admins can update all profiles"
ON public.user_profiles
FOR UPDATE
USING (has_role_secure(auth.uid(), 'admin'::app_role) OR has_role_secure(auth.uid(), 'superadmin'::app_role));