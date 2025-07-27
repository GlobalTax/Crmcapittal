-- Final Security Fix: Complete the search_path protection for all remaining functions
-- Address all remaining SECURITY DEFINER functions that need search_path protection

-- Fix update_contact_last_interaction
DROP FUNCTION IF EXISTS public.update_contact_last_interaction();
CREATE OR REPLACE FUNCTION public.update_contact_last_interaction()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.contacts 
  SET last_interaction_date = NEW.interaction_date
  WHERE id = NEW.contact_id;
  RETURN NEW;
END;
$function$;

-- Fix handle_new_user
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.user_profiles (id, first_name, last_name)
  values (new.id, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name');
  return new;
end;
$function$;

-- Fix update_reconversion_subfase
DROP FUNCTION IF EXISTS public.update_reconversion_subfase(uuid, reconversion_subfase, uuid);
CREATE OR REPLACE FUNCTION public.update_reconversion_subfase(reconversion_id uuid, new_subfase reconversion_subfase, user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  old_subfase reconversion_subfase;
BEGIN
  -- Obtener subfase actual
  SELECT subfase INTO old_subfase
  FROM public.reconversiones_new
  WHERE id = reconversion_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Actualizar subfase
  UPDATE public.reconversiones_new 
  SET 
    subfase = new_subfase,
    last_activity_at = now(),
    updated_at = now()
  WHERE id = reconversion_id;
  
  -- Registrar en audit log
  PERFORM public.log_reconversion_audit(
    reconversion_id,
    'subfase_change',
    'Cambio de subfase: ' || old_subfase::text || ' → ' || new_subfase::text,
    jsonb_build_object('old_subfase', old_subfase),
    jsonb_build_object('new_subfase', new_subfase),
    'info',
    jsonb_build_object('automated', false, 'user_id', user_id)
  );
  
  RETURN TRUE;
END;
$function$;

-- Fix create_reconversion_with_workflow
DROP FUNCTION IF EXISTS public.create_reconversion_with_workflow(jsonb, uuid);
CREATE OR REPLACE FUNCTION public.create_reconversion_with_workflow(reconversion_data jsonb, user_id uuid DEFAULT auth.uid())
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_reconversion_id UUID;
BEGIN
  -- Crear reconversión
  INSERT INTO public.reconversiones_new (
    company_name,
    contact_name,
    buyer_contact_email,
    target_sectors,
    geographic_preferences,
    investment_capacity_min,
    investment_capacity_max,
    revenue_range_min,
    revenue_range_max,
    ebitda_range_min,
    ebitda_range_max,
    original_rejection_reason,
    reconversion_approach,
    notes,
    estado,
    subfase,
    prioridad,
    created_by,
    assigned_to,
    pipeline_owner_id
  ) VALUES (
    reconversion_data->>'company_name',
    reconversion_data->>'contact_name',
    reconversion_data->>'buyer_contact_email',
    CASE WHEN reconversion_data->'target_sectors' IS NOT NULL 
         THEN ARRAY(SELECT jsonb_array_elements_text(reconversion_data->'target_sectors'))
         ELSE NULL END,
    CASE WHEN reconversion_data->'geographic_preferences' IS NOT NULL 
         THEN ARRAY(SELECT jsonb_array_elements_text(reconversion_data->'geographic_preferences'))
         ELSE NULL END,
    (reconversion_data->>'investment_capacity_min')::NUMERIC,
    (reconversion_data->>'investment_capacity_max')::NUMERIC,
    (reconversion_data->>'revenue_range_min')::NUMERIC,
    (reconversion_data->>'revenue_range_max')::NUMERIC,
    (reconversion_data->>'ebitda_range_min')::NUMERIC,
    (reconversion_data->>'ebitda_range_max')::NUMERIC,
    reconversion_data->>'original_rejection_reason',
    reconversion_data->>'reconversion_approach',
    reconversion_data->>'notes',
    'activa'::reconversion_estado,
    'prospecting'::reconversion_subfase,
    'media'::reconversion_prioridad,
    user_id,
    (reconversion_data->>'assigned_to')::UUID,
    user_id
  ) RETURNING id INTO new_reconversion_id;
  
  RETURN new_reconversion_id;
END;
$function$;

-- Fix process_reconversion_closure
DROP FUNCTION IF EXISTS public.process_reconversion_closure(uuid, jsonb, uuid);
CREATE OR REPLACE FUNCTION public.process_reconversion_closure(reconversion_id uuid, closure_data jsonb, user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Actualizar reconversión a cerrada
  UPDATE public.reconversiones_new 
  SET 
    estado = 'cerrada'::reconversion_estado,
    fecha_cierre = now(),
    enterprise_value = (closure_data->>'enterprise_value')::NUMERIC,
    equity_percentage = (closure_data->>'equity_percentage')::NUMERIC,
    updated_at = now()
  WHERE id = reconversion_id;
  
  -- Enviar notificación de cierre exitoso
  PERFORM public.send_reconversion_notification(
    reconversion_id,
    'closure_success',
    user_id,
    'Reconversión cerrada exitosamente',
    'La reconversión ha sido cerrada. Por favor, procede a registrar los honorarios correspondientes.',
    jsonb_build_object(
      'enterprise_value', closure_data->>'enterprise_value',
      'equity_percentage', closure_data->>'equity_percentage'
    )
  );
  
  RETURN TRUE;
END;
$function$;