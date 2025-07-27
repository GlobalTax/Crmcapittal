-- Continue Security Fixes: Address remaining function search path issues
-- Fix the remaining functions that need search_path protection

-- Fix reconversion-related functions
DROP FUNCTION IF EXISTS public.log_reconversion_audit(uuid, text, text, jsonb, jsonb, text, jsonb);
CREATE OR REPLACE FUNCTION public.log_reconversion_audit(p_reconversion_id uuid, p_action_type text, p_action_description text, p_old_data jsonb DEFAULT NULL::jsonb, p_new_data jsonb DEFAULT NULL::jsonb, p_severity text DEFAULT 'info'::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  log_id uuid;
  current_user_email text;
BEGIN
  -- Obtener email del usuario actual
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = auth.uid();

  INSERT INTO public.reconversion_audit_logs (
    reconversion_id,
    action_type,
    action_description,
    old_data,
    new_data,
    user_id,
    user_email,
    ip_address,
    severity,
    metadata
  ) VALUES (
    p_reconversion_id,
    p_action_type,
    p_action_description,
    p_old_data,
    p_new_data,
    auth.uid(),
    current_user_email,
    inet_client_addr(),
    p_severity,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- Fix send_reconversion_notification
DROP FUNCTION IF EXISTS public.send_reconversion_notification(uuid, text, uuid, text, text, jsonb);
CREATE OR REPLACE FUNCTION public.send_reconversion_notification(p_reconversion_id uuid, p_notification_type text, p_recipient_user_id uuid, p_title text, p_message text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  notification_id UUID;
  recipient_email TEXT;
BEGIN
  -- Obtener email del destinatario
  SELECT email INTO recipient_email
  FROM auth.users
  WHERE id = p_recipient_user_id;
  
  IF recipient_email IS NULL THEN
    RAISE EXCEPTION 'Recipient user not found';
  END IF;
  
  -- Insertar notificación
  INSERT INTO public.reconversion_notifications (
    reconversion_id,
    notification_type,
    recipient_user_id,
    recipient_email,
    title,
    message,
    sent_in_app,
    metadata
  ) VALUES (
    p_reconversion_id,
    p_notification_type,
    p_recipient_user_id,
    recipient_email,
    p_title,
    p_message,
    true,
    p_metadata
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

-- Fix sanitize_reconversion_data
DROP FUNCTION IF EXISTS public.sanitize_reconversion_data(jsonb);
CREATE OR REPLACE FUNCTION public.sanitize_reconversion_data(p_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  sanitized_data jsonb := p_data;
BEGIN
  -- Sanitizar campos de texto (remover HTML, scripts, etc.)
  IF sanitized_data ? 'company_name' THEN
    sanitized_data := jsonb_set(
      sanitized_data,
      '{company_name}',
      to_jsonb(regexp_replace(sanitized_data->>'company_name', '<[^>]*>', '', 'g'))
    );
  END IF;
  
  IF sanitized_data ? 'original_rejection_reason' THEN
    sanitized_data := jsonb_set(
      sanitized_data,
      '{original_rejection_reason}',
      to_jsonb(regexp_replace(sanitized_data->>'original_rejection_reason', '<[^>]*>', '', 'g'))
    );
  END IF;
  
  -- Validar rangos numéricos
  IF sanitized_data ? 'investment_capacity_min' THEN
    IF (sanitized_data->>'investment_capacity_min')::numeric < 0 THEN
      sanitized_data := jsonb_set(sanitized_data, '{investment_capacity_min}', '0');
    END IF;
  END IF;
  
  IF sanitized_data ? 'investment_capacity_max' THEN
    IF (sanitized_data->>'investment_capacity_max')::numeric < 0 THEN
      sanitized_data := jsonb_set(sanitized_data, '{investment_capacity_max}', '0');
    END IF;
  END IF;
  
  RETURN sanitized_data;
END;
$function$;

-- Fix match_targets_for_reconversion
DROP FUNCTION IF EXISTS public.match_targets_for_reconversion(uuid);
CREATE OR REPLACE FUNCTION public.match_targets_for_reconversion(reconversion_id uuid)
 RETURNS TABLE(target_count integer, matched_companies jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  reconversion_record RECORD;
  match_count INTEGER;
  matches JSONB;
BEGIN
  -- Obtener datos de la reconversión
  SELECT * INTO reconversion_record
  FROM public.reconversiones_new
  WHERE id = reconversion_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reconversión no encontrada';
  END IF;
  
  -- Buscar empresas que coincidan con los criterios
  WITH matched_targets AS (
    SELECT 
      c.id,
      c.name,
      c.industry,
      c.annual_revenue,
      c.city,
      c.company_size
    FROM public.companies c
    WHERE 
      -- Coincidencia por sectores objetivo
      (reconversion_record.target_sectors IS NULL OR 
       reconversion_record.target_sectors && ARRAY[c.industry])
      AND
      -- Coincidencia por ubicación geográfica
      (reconversion_record.geographic_preferences IS NULL OR 
       reconversion_record.geographic_preferences && ARRAY[c.city])
      AND
      -- Rango de facturación
      (reconversion_record.revenue_range_min IS NULL OR 
       c.annual_revenue >= reconversion_record.revenue_range_min)
      AND
      (reconversion_record.revenue_range_max IS NULL OR 
       c.annual_revenue <= reconversion_record.revenue_range_max)
      AND
      -- Excluir la propia empresa si coincide
      c.name != reconversion_record.company_name
    LIMIT 50
  )
  SELECT 
    COUNT(*)::INTEGER,
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', mt.id,
        'name', mt.name,
        'industry', mt.industry,
        'revenue', mt.annual_revenue,
        'location', mt.city,
        'size', mt.company_size
      )
    ), '[]'::jsonb)
  INTO match_count, matches
  FROM matched_targets mt;
  
  -- Actualizar la reconversión con los resultados
  UPDATE public.reconversiones_new 
  SET 
    matched_targets_count = match_count,
    matched_targets_data = matches,
    last_matching_at = now(),
    updated_at = now()
  WHERE id = reconversion_id;
  
  RETURN QUERY SELECT match_count, matches;
END;
$function$;