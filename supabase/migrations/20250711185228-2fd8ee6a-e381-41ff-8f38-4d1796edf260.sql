-- Asignar rol de superadmin al usuario actual
INSERT INTO public.user_roles (user_id, role)
VALUES (auth.uid(), 'superadmin'::public.app_role)
ON CONFLICT (user_id, role) DO NOTHING;