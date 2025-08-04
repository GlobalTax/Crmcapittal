-- Fix missing user profile and critical security issues

-- 1. Insert missing user profile record
INSERT INTO public.user_profiles (id, first_name, last_name, onboarding_complete)
VALUES ('22873c0f-61da-4cd9-94d9-bcde55bc7ca8', 'Sebastian', 'Navarro', true)
ON CONFLICT (id) DO UPDATE SET
  onboarding_complete = EXCLUDED.onboarding_complete;

-- 2. Fix overly permissive RLS policies

-- Fix lead_nurturing table (currently USING (true))
DROP POLICY IF EXISTS "Users can manage lead nurturing data" ON public.lead_nurturing;
CREATE POLICY "Users can manage their lead nurturing data" 
ON public.lead_nurturing 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.id = lead_nurturing.lead_id 
    AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
  )
  OR has_role_secure(auth.uid(), 'admin'::app_role) 
  OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Fix communication_templates table  
DROP POLICY IF EXISTS "Users can view all communication templates" ON public.communication_templates;
CREATE POLICY "Users can view communication templates" 
ON public.communication_templates 
FOR SELECT 
USING (
  created_by = auth.uid() 
  OR has_role_secure(auth.uid(), 'admin'::app_role) 
  OR has_role_secure(auth.uid(), 'superadmin'::app_role)
  OR is_active = true
);

-- Fix contact_interactions table
DROP POLICY IF EXISTS "Users can view all contact interactions" ON public.contact_interactions;
CREATE POLICY "Users can view contact interactions" 
ON public.contact_interactions 
FOR SELECT 
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM contacts 
    WHERE contacts.id = contact_interactions.contact_id 
    AND contacts.created_by = auth.uid()
  )
  OR has_role_secure(auth.uid(), 'admin'::app_role) 
  OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Fix contact_notes table
DROP POLICY IF EXISTS "Users can view all contact notes" ON public.contact_notes;
CREATE POLICY "Users can view contact notes" 
ON public.contact_notes 
FOR SELECT 
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM contacts 
    WHERE contacts.id = contact_notes.contact_id 
    AND contacts.created_by = auth.uid()
  )
  OR has_role_secure(auth.uid(), 'admin'::app_role) 
  OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Fix contact_reminders table
DROP POLICY IF EXISTS "Users can view all contact reminders" ON public.contact_reminders;
CREATE POLICY "Users can view contact reminders" 
ON public.contact_reminders 
FOR SELECT 
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM contacts 
    WHERE contacts.id = contact_reminders.contact_id 
    AND contacts.created_by = auth.uid()
  )
  OR has_role_secure(auth.uid(), 'admin'::app_role) 
  OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Fix company_notes table
DROP POLICY IF EXISTS "Users can view all company notes" ON public.company_notes;
CREATE POLICY "Users can view company notes" 
ON public.company_notes 
FOR SELECT 
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = company_notes.company_id 
    AND companies.created_by = auth.uid()
  )
  OR has_role_secure(auth.uid(), 'admin'::app_role) 
  OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Fix collaborators table (too permissive for viewing)
DROP POLICY IF EXISTS "Users can view all collaborators" ON public.collaborators;
CREATE POLICY "Users can view collaborators" 
ON public.collaborators 
FOR SELECT 
USING (
  created_by = auth.uid()
  OR user_id = auth.uid()
  OR has_role_secure(auth.uid(), 'admin'::app_role) 
  OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- 3. Fix functions with missing search path settings
CREATE OR REPLACE FUNCTION public.trigger_update_prob_conversion()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.score IS DISTINCT FROM NEW.score THEN
    NEW.prob_conversion = LEAST(1.0, GREATEST(0.0, COALESCE(NEW.score, 0) / 100.0));
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.recalcular_prob_conversion_lead(p_lead_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_score INTEGER;
  new_prob_conversion NUMERIC;
BEGIN
  SELECT COALESCE(score, 0) INTO current_score
  FROM leads 
  WHERE id = p_lead_id;
  
  new_prob_conversion := LEAST(1.0, GREATEST(0.0, current_score / 100.0));
  
  UPDATE leads 
  SET prob_conversion = new_prob_conversion
  WHERE id = p_lead_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.recalcular_todas_prob_conversion_winback()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  lead_record RECORD;
  total_updated INTEGER := 0;
BEGIN
  FOR lead_record IN 
    SELECT id, score 
    FROM leads 
    WHERE winback_stage IS NOT NULL
  LOOP
    PERFORM recalcular_prob_conversion_lead(lead_record.id);
    total_updated := total_updated + 1;
  END LOOP;
END;
$$;

-- 4. Enhance security logging for critical operations
CREATE OR REPLACE FUNCTION public.assign_user_role_secure(_target_user_id uuid, _role app_role)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_role app_role;
  result jsonb;
BEGIN
  SELECT public.get_user_highest_role(auth.uid()) INTO current_user_role;
  
  IF current_user_role IS NULL OR current_user_role NOT IN ('admin', 'superadmin') THEN
    PERFORM public.enhanced_log_security_event(
      'role_assignment_denied',
      'high',
      'Intento de asignación de rol denegado por falta de permisos',
      jsonb_build_object(
        'target_user_id', _target_user_id,
        'attempted_role', _role,
        'current_user_role', current_user_role
      )
    );
    RETURN jsonb_build_object('success', false, 'error', 'No tienes permisos para asignar roles');
  END IF;
  
  IF auth.uid() = _target_user_id THEN
    PERFORM public.enhanced_log_security_event(
      'self_role_assignment_attempt',
      'critical',
      'Intento de auto-asignación de rol detectado',
      jsonb_build_object('attempted_role', _role)
    );
    RETURN jsonb_build_object('success', false, 'error', 'No puedes asignarte roles a ti mismo');
  END IF;
  
  IF _role = 'superadmin' AND current_user_role != 'superadmin' THEN
    PERFORM public.enhanced_log_security_event(
      'superadmin_assignment_denied',
      'critical',
      'Intento de asignación de rol superadmin sin permisos',
      jsonb_build_object(
        'target_user_id', _target_user_id,
        'current_user_role', current_user_role
      )
    );
    RETURN jsonb_build_object('success', false, 'error', 'Solo los superadministradores pueden asignar roles de superadministrador');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _target_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuario no encontrado');
  END IF;
  
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (_target_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  PERFORM public.enhanced_log_security_event(
    'role_assigned_secure',
    'high',
    'Rol asignado de forma segura: ' || _role::text,
    jsonb_build_object(
      'target_user_id', _target_user_id,
      'assigned_role', _role,
      'assigned_by', auth.uid()
    )
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Rol asignado exitosamente');
  
EXCEPTION
  WHEN OTHERS THEN
    PERFORM public.enhanced_log_security_event(
      'role_assignment_failed',
      'high',
      'Error al asignar rol: ' || SQLERRM,
      jsonb_build_object(
        'target_user_id', _target_user_id,
        'attempted_role', _role,
        'attempted_by', auth.uid(),
        'error', SQLERRM
      )
    );
    RETURN jsonb_build_object('success', false, 'error', 'Error interno al asignar rol');
END;
$$;