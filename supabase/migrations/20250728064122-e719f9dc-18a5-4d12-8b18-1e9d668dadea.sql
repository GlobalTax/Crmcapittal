-- Sistema completo de asignación automática de leads con tarea de cualificación

-- Función auxiliar para crear tarea de cualificación automática
CREATE OR REPLACE FUNCTION public.create_qualification_task(p_lead_id UUID, p_assigned_to UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  task_id UUID;
  existing_task_count INTEGER;
BEGIN
  -- Verificar si ya existe una tarea de cualificación para este lead
  SELECT COUNT(*) INTO existing_task_count
  FROM lead_tasks 
  WHERE lead_id = p_lead_id 
  AND title ILIKE '%cualificación%'
  AND status != 'completed';
  
  -- Solo crear si no existe una tarea similar activa
  IF existing_task_count = 0 THEN
    INSERT INTO public.lead_tasks (
      lead_id,
      title,
      description,
      due_date,
      priority,
      status,
      assigned_to,
      created_by
    ) VALUES (
      p_lead_id,
      'Llamada de cualificación 24h',
      'Realizar llamada de cualificación inicial al lead para evaluar su potencial y necesidades',
      now() + interval '24 hours',
      'high',
      'pending',
      p_assigned_to,
      p_assigned_to
    ) RETURNING id INTO task_id;
    
    RAISE NOTICE 'Tarea de cualificación creada para lead %: %', p_lead_id, task_id;
  ELSE
    RAISE NOTICE 'Ya existe una tarea de cualificación activa para lead %', p_lead_id;
  END IF;
  
  RETURN task_id;
END;
$function$;

-- Función principal de asignación automática con creación de tarea
CREATE OR REPLACE FUNCTION public.assign_owner_on_create(p_lead_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  assigned_user_id UUID;
  task_id UUID;
  lead_record RECORD;
  result JSONB;
BEGIN
  -- Obtener datos del lead
  SELECT * INTO lead_record FROM leads WHERE id = p_lead_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Lead no encontrado',
      'lead_id', p_lead_id
    );
  END IF;
  
  -- Solo proceder si el lead no tiene ya un owner asignado
  IF lead_record.assigned_to_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'El lead ya tiene un owner asignado',
      'lead_id', p_lead_id,
      'assigned_to', lead_record.assigned_to_id
    );
  END IF;
  
  -- Usar la función existente auto_assign_lead para asignar usuario
  BEGIN
    SELECT public.auto_assign_lead(p_lead_id) INTO assigned_user_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error en auto_assign_lead: %', SQLERRM;
      assigned_user_id := NULL;
  END;
  
  -- Si se asignó exitosamente, crear la tarea de cualificación
  IF assigned_user_id IS NOT NULL THEN
    BEGIN
      SELECT public.create_qualification_task(p_lead_id, assigned_user_id) INTO task_id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Error creando tarea de cualificación: %', SQLERRM;
        task_id := NULL;
    END;
    
    result := jsonb_build_object(
      'success', true,
      'message', 'Lead asignado exitosamente con tarea de cualificación',
      'lead_id', p_lead_id,
      'assigned_to', assigned_user_id,
      'task_id', task_id
    );
  ELSE
    -- Si no se pudo asignar, intentar asignar a un admin disponible
    SELECT user_id INTO assigned_user_id
    FROM user_roles 
    WHERE role IN ('admin', 'superadmin')
    ORDER BY user_id
    LIMIT 1;
    
    IF assigned_user_id IS NOT NULL THEN
      -- Actualizar el lead manualmente con admin
      UPDATE leads 
      SET assigned_to_id = assigned_user_id, updated_at = now()
      WHERE id = p_lead_id;
      
      -- Crear tarea de cualificación
      SELECT public.create_qualification_task(p_lead_id, assigned_user_id) INTO task_id;
      
      result := jsonb_build_object(
        'success', true,
        'message', 'Lead asignado a administrador por fallback',
        'lead_id', p_lead_id,
        'assigned_to', assigned_user_id,
        'task_id', task_id,
        'fallback', true
      );
    ELSE
      result := jsonb_build_object(
        'success', false,
        'message', 'No se pudo asignar el lead - no hay usuarios disponibles',
        'lead_id', p_lead_id
      );
    END IF;
  END IF;
  
  -- Log de auditoría
  PERFORM public.log_security_event(
    'lead_auto_assigned',
    'info',
    'Lead asignado automáticamente: ' || result->>'message',
    result || jsonb_build_object('timestamp', now())
  );
  
  RETURN result;
END;
$function$;

-- Función del trigger para AFTER INSERT
CREATE OR REPLACE FUNCTION public.assign_owner_on_create_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  assignment_result JSONB;
BEGIN
  -- Solo ejecutar si el lead no tiene assigned_to_id
  IF NEW.assigned_to_id IS NULL THEN
    -- Ejecutar asignación automática de forma asíncrona para evitar bloqueos
    BEGIN
      SELECT public.assign_owner_on_create(NEW.id) INTO assignment_result;
      
      RAISE NOTICE 'Asignación automática ejecutada para lead %: %', 
        NEW.id, assignment_result->>'message';
        
    EXCEPTION
      WHEN OTHERS THEN
        -- No fallar el INSERT si hay error en la asignación
        RAISE NOTICE 'Error en asignación automática para lead %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Crear el trigger en la tabla leads
DROP TRIGGER IF EXISTS trigger_assign_owner_on_create ON public.leads;

CREATE TRIGGER trigger_assign_owner_on_create
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_owner_on_create_trigger();

-- Función para verificar el estado del sistema de asignación automática
CREATE OR REPLACE FUNCTION public.check_auto_assignment_system()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  active_rules_count INTEGER;
  available_users_count INTEGER;
  recent_assignments_count INTEGER;
  system_status JSONB;
BEGIN
  -- Contar reglas de asignación activas
  SELECT COUNT(*) INTO active_rules_count
  FROM lead_assignment_rules
  WHERE is_active = true;
  
  -- Contar usuarios disponibles para asignación
  SELECT COUNT(DISTINCT user_id) INTO available_users_count
  FROM user_roles
  WHERE role IN ('admin', 'superadmin', 'user');
  
  -- Contar asignaciones recientes (últimas 24h)
  SELECT COUNT(*) INTO recent_assignments_count
  FROM leads
  WHERE assigned_to_id IS NOT NULL
  AND created_at >= now() - interval '24 hours';
  
  system_status := jsonb_build_object(
    'system_active', true,
    'active_assignment_rules', active_rules_count,
    'available_users', available_users_count,
    'recent_assignments_24h', recent_assignments_count,
    'last_check', now(),
    'trigger_exists', (
      SELECT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_assign_owner_on_create'
        AND event_object_table = 'leads'
      )
    )
  );
  
  RETURN system_status;
END;
$function$;