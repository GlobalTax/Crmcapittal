-- Asignar rol de superadmin al usuario actual que está logueado
INSERT INTO public.user_roles (user_id, role)
VALUES ('22873c0f-61da-4cd9-94d9-bcde55bc7ca8', 'superadmin'::public.app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- Verificar que se asignó correctamente
SELECT ur.user_id, ur.role, au.email 
FROM public.user_roles ur 
JOIN auth.users au ON ur.user_id = au.id 
WHERE ur.user_id = '22873c0f-61da-4cd9-94d9-bcde55bc7ca8';