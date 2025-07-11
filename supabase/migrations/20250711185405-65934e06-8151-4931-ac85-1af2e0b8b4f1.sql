-- Asignar rol de superadmin al usuario más reciente
INSERT INTO public.user_roles (user_id, role)
VALUES ('dae71af9-d64a-407c-b509-ee7ee8371618', 'superadmin'::public.app_role)
ON CONFLICT (user_id, role) DO NOTHING;