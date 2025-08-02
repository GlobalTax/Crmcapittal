-- PHASE 1: DATABASE SECURITY FIXES

-- Fix 1: Add search_path to functions that need it
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
DECLARE
    result jsonb := '{"valid": true, "errors": []}'::jsonb;
    errors text[] := ARRAY[]::text[];
BEGIN
    -- Check minimum length
    IF length(password) < 8 THEN
        errors := array_append(errors, 'La contraseña debe tener al menos 8 caracteres');
    END IF;
    
    -- Check for uppercase letter
    IF password !~ '[A-Z]' THEN
        errors := array_append(errors, 'La contraseña debe contener al menos una letra mayúscula');
    END IF;
    
    -- Check for lowercase letter
    IF password !~ '[a-z]' THEN
        errors := array_append(errors, 'La contraseña debe contener al menos una letra minúscula');
    END IF;
    
    -- Check for number
    IF password !~ '[0-9]' THEN
        errors := array_append(errors, 'La contraseña debe contener al menos un número');
    END IF;
    
    -- Check for special character
    IF password !~ '[^a-zA-Z0-9]' THEN
        errors := array_append(errors, 'La contraseña debe contener al menos un carácter especial');
    END IF;
    
    -- Update result
    IF array_length(errors, 1) > 0 THEN
        result := jsonb_build_object('valid', false, 'errors', errors);
    END IF;
    
    RETURN result;
END;
$function$;

-- Fix 2: Create secure function for user creation with proper role assignment
CREATE OR REPLACE FUNCTION public.create_user_with_role_secure(
    p_email text,
    p_password text,
    p_role app_role,
    p_first_name text DEFAULT NULL,
    p_last_name text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    current_user_role app_role;
    new_user_id uuid;
    result jsonb;
BEGIN
    -- Get current user's highest role
    SELECT public.get_user_highest_role(auth.uid()) INTO current_user_role;
    
    -- Validation: Only admins and superadmins can create users
    IF current_user_role IS NULL OR current_user_role NOT IN ('admin', 'superadmin') THEN
        RETURN jsonb_build_object('success', false, 'error', 'No tienes permisos para crear usuarios');
    END IF;
    
    -- Validation: Only superadmins can create superadmin users
    IF p_role = 'superadmin' AND current_user_role != 'superadmin' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Solo los superadministradores pueden crear otros superadministradores');
    END IF;
    
    -- Validate password strength
    DECLARE
        password_validation jsonb;
    BEGIN
        SELECT public.validate_password_strength(p_password) INTO password_validation;
        
        IF NOT (password_validation->>'valid')::boolean THEN
            RETURN jsonb_build_object(
                'success', false, 
                'error', 'Contraseña no válida',
                'validation_errors', password_validation->'errors'
            );
        END IF;
    END;
    
    -- Create user profile first (will be linked when auth user is created)
    INSERT INTO public.user_profiles (first_name, last_name)
    VALUES (p_first_name, p_last_name)
    RETURNING id INTO new_user_id;
    
    -- Note: The actual auth user creation must be done client-side due to Supabase limitations
    -- This function will be called after successful auth.signUp to assign the role
    
    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Usuario preparado para creación',
        'profile_id', new_user_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error
        PERFORM public.log_security_event(
            'user_creation_failed',
            'high',
            'Error al crear usuario: ' || SQLERRM,
            jsonb_build_object(
                'attempted_email', p_email,
                'attempted_role', p_role,
                'attempted_by', auth.uid(),
                'error_message', SQLERRM
            )
        );
        
        RETURN jsonb_build_object('success', false, 'error', 'Error interno al crear usuario: ' || SQLERRM);
END;
$function$;

-- Fix 3: Create a secure function to assign roles after user creation
CREATE OR REPLACE FUNCTION public.assign_role_after_signup(
    p_user_id uuid,
    p_role app_role
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    current_user_role app_role;
    result jsonb;
BEGIN
    -- Get current user's highest role
    SELECT public.get_user_highest_role(auth.uid()) INTO current_user_role;
    
    -- Validation: Only admins and superadmins can assign roles
    IF current_user_role IS NULL OR current_user_role NOT IN ('admin', 'superadmin') THEN
        RETURN jsonb_build_object('success', false, 'error', 'No tienes permisos para asignar roles');
    END IF;
    
    -- Validation: Only superadmins can assign superadmin role
    IF p_role = 'superadmin' AND current_user_role != 'superadmin' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Solo los superadministradores pueden asignar roles de superadministrador');
    END IF;
    
    -- Assign the role
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (p_user_id, p_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Log the role assignment
    PERFORM public.log_security_event(
        'role_assigned_after_signup',
        'high',
        'Rol asignado después del registro: ' || p_role::text,
        jsonb_build_object(
            'target_user_id', p_user_id,
            'assigned_role', p_role,
            'assigned_by', auth.uid()
        )
    );
    
    RETURN jsonb_build_object('success', true, 'message', 'Rol asignado exitosamente');
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error
        PERFORM public.log_security_event(
            'role_assignment_after_signup_failed',
            'high',
            'Error al asignar rol después del registro: ' || SQLERRM,
            jsonb_build_object(
                'target_user_id', p_user_id,
                'attempted_role', p_role,
                'attempted_by', auth.uid(),
                'error_message', SQLERRM
            )
        );
        
        RETURN jsonb_build_object('success', false, 'error', 'Error interno al asignar rol');
END;
$function$;

-- Fix 4: Update other functions to have proper search_path
CREATE OR REPLACE FUNCTION public.get_user_highest_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'superadmin' THEN 3
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 1
      ELSE 0
    END DESC
  LIMIT 1
$function$;

-- Fix 5: Create secure function to check roles
CREATE OR REPLACE FUNCTION public.has_role_secure(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;