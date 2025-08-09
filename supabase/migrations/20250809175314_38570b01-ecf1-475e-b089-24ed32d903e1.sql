-- Crear tareas iniciales del motor al crear un lead
-- Función trigger + trigger AFTER INSERT en public.leads

CREATE OR REPLACE FUNCTION public.create_default_lead_tasks()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_assignee uuid;
  v_creator uuid;
  v_now timestamptz := now();
BEGIN
  v_creator := auth.uid();
  -- usar assigned_to_id si existe, en caso contrario quien crea
  BEGIN
    v_assignee := NEW.assigned_to_id;
  EXCEPTION WHEN undefined_column THEN
    v_assignee := v_creator;
  END;
  v_assignee := COALESCE(v_assignee, v_creator);

  -- Helper local: insertar una tarea si no existe ya ese tipo para el lead
  -- Nota: evitamos duplicados por tipo/lead con NOT EXISTS
  -- whatsapp
  IF NOT EXISTS (
    SELECT 1 FROM public.lead_task_engine 
    WHERE lead_id = NEW.id AND type = 'whatsapp'
  ) THEN
    INSERT INTO public.lead_task_engine (
      lead_id, type, title, description, due_date, assigned_to, priority, status,
      dependencies, metadata, created_by, created_at, updated_at, sla_hours
    ) VALUES (
      NEW.id,
      'whatsapp',
      'WhatsApp de contacto',
      NULL,
      v_now,
      v_assignee,
      'medium',
      'open',
      ARRAY[]::text[],
      jsonb_build_object('plantilla','whatsapp_touch_v1','link_agenda',true),
      v_creator,
      v_now,
      v_now,
      0
    );
  END IF;

  -- llamada
  IF NOT EXISTS (
    SELECT 1 FROM public.lead_task_engine 
    WHERE lead_id = NEW.id AND type = 'llamada'
  ) THEN
    INSERT INTO public.lead_task_engine (
      lead_id, type, title, description, due_date, assigned_to, priority, status,
      dependencies, metadata, created_by, created_at, updated_at, sla_hours
    ) VALUES (
      NEW.id,
      'llamada',
      'Llamada telefónica al lead',
      NULL,
      v_now + interval '1 day',
      v_assignee,
      'medium',
      'open',
      ARRAY[]::text[],
      jsonb_build_object('script','call_script_v1','objetivo','calificar necesidad'),
      v_creator,
      v_now,
      v_now,
      24
    );
  END IF;

  -- videollamada (deps sugeridas en metadata, no bloqueantes)
  IF NOT EXISTS (
    SELECT 1 FROM public.lead_task_engine 
    WHERE lead_id = NEW.id AND type = 'videollamada'
  ) THEN
    INSERT INTO public.lead_task_engine (
      lead_id, type, title, description, due_date, assigned_to, priority, status,
      dependencies, metadata, created_by, created_at, updated_at, sla_hours
    ) VALUES (
      NEW.id,
      'videollamada',
      'Agendar video llamada',
      NULL,
      v_now,
      v_assignee,
      'high',
      'open',
      ARRAY[]::text[],
      jsonb_build_object('plataforma','Teams/Zoom','link_auto',true,'asistentes_sugeridos', jsonb_build_array('owner','analista'),'duracion','30m','deps_sugeridas', jsonb_build_array('whatsapp','llamada')),
      v_creator,
      v_now,
      v_now,
      0
    );
  END IF;

  -- informe_mercado
  IF NOT EXISTS (
    SELECT 1 FROM public.lead_task_engine 
    WHERE lead_id = NEW.id AND type = 'informe_mercado'
  ) THEN
    INSERT INTO public.lead_task_engine (
      lead_id, type, title, description, due_date, assigned_to, priority, status,
      dependencies, metadata, created_by, created_at, updated_at, sla_hours
    ) VALUES (
      NEW.id,
      'informe_mercado',
      'Crear informe de mercado',
      NULL,
      v_now + interval '2 day',
      v_assignee,
      'medium',
      'open',
      ARRAY[]::text[],
      jsonb_build_object('formato','PDF','estructura', jsonb_build_array('tamaño mercado','tendencias','competidores','múltiplos','SWOT','fuentes'),'storage_path','', 'review_status','pending'),
      v_creator,
      v_now,
      v_now,
      48
    );
  END IF;

  -- preguntas_reunion (deps sugeridas)
  IF NOT EXISTS (
    SELECT 1 FROM public.lead_task_engine 
    WHERE lead_id = NEW.id AND type = 'preguntas_reunion'
  ) THEN
    INSERT INTO public.lead_task_engine (
      lead_id, type, title, description, due_date, assigned_to, priority, status,
      dependencies, metadata, created_by, created_at, updated_at, sla_hours
    ) VALUES (
      NEW.id,
      'preguntas_reunion',
      'Preparar preguntas para reunión',
      NULL,
      v_now + interval '1 day',
      v_assignee,
      'high',
      'open',
      ARRAY[]::text[],
      jsonb_build_object('bloques', jsonb_build_array('objetivos','dolores','finanzas','decisión','siguiente_paso'), 'deps_sugeridas', jsonb_build_array('informe_mercado')),
      v_creator,
      v_now,
      v_now,
      24
    );
  END IF;

  -- datos_sabi
  IF NOT EXISTS (
    SELECT 1 FROM public.lead_task_engine 
    WHERE lead_id = NEW.id AND type = 'datos_sabi'
  ) THEN
    INSERT INTO public.lead_task_engine (
      lead_id, type, title, description, due_date, assigned_to, priority, status,
      dependencies, metadata, created_by, created_at, updated_at, sla_hours
    ) VALUES (
      NEW.id,
      'datos_sabi',
      'Descargar datos SABI/eInforma',
      NULL,
      v_now,
      v_assignee,
      'high',
      'open',
      ARRAY[]::text[],
      jsonb_build_object('fuente','einforma','campos', jsonb_build_array('facturacion','ebitda','deuda','plantilla')),
      v_creator,
      v_now,
      v_now,
      0
    );
  END IF;

  -- balances_4y (depende de datos_sabi)
  IF NOT EXISTS (
    SELECT 1 FROM public.lead_task_engine 
    WHERE lead_id = NEW.id AND type = 'balances_4y'
  ) THEN
    INSERT INTO public.lead_task_engine (
      lead_id, type, title, description, due_date, assigned_to, priority, status,
      dependencies, metadata, created_by, created_at, updated_at, sla_hours
    ) VALUES (
      NEW.id,
      'balances_4y',
      'Incorporar balances 4 años y cuenta de explotación',
      NULL,
      v_now + interval '2 day',
      v_assignee,
      'high',
      'open',
      ARRAY['datos_sabi']::text[],
      jsonb_build_object('origen','excel/pdf','funcion_parser','process-excel-valoracion'),
      v_creator,
      v_now,
      v_now,
      48
    );
  END IF;

  -- valoracion_inicial (deps sugeridas)
  IF NOT EXISTS (
    SELECT 1 FROM public.lead_task_engine 
    WHERE lead_id = NEW.id AND type = 'valoracion_inicial'
  ) THEN
    INSERT INTO public.lead_task_engine (
      lead_id, type, title, description, due_date, assigned_to, priority, status,
      dependencies, metadata, created_by, created_at, updated_at, sla_hours
    ) VALUES (
      NEW.id,
      'valoracion_inicial',
      'Enviar valoración inicial gratuita',
      NULL,
      v_now + interval '1 day',
      v_assignee,
      'high',
      'open',
      ARRAY[]::text[],
      jsonb_build_object('plantilla_pdf','valuation_light','multiples_fuente','einforma/sabi','deps_sugeridas', jsonb_build_array('informe_mercado','balances_4y')),
      v_creator,
      v_now,
      v_now,
      24
    );
  END IF;

  -- perfilar_oportunidad (depende de informe_mercado y balances_4y)
  IF NOT EXISTS (
    SELECT 1 FROM public.lead_task_engine 
    WHERE lead_id = NEW.id AND type = 'perfilar_oportunidad'
  ) THEN
    INSERT INTO public.lead_task_engine (
      lead_id, type, title, description, due_date, assigned_to, priority, status,
      dependencies, metadata, created_by, created_at, updated_at, sla_hours
    ) VALUES (
      NEW.id,
      'perfilar_oportunidad',
      'Perfilar la oportunidad',
      NULL,
      v_now + interval '3 day',
      v_assignee,
      'medium',
      'open',
      ARRAY['informe_mercado','balances_4y']::text[],
      jsonb_build_object('score_campos', jsonb_build_array('atractivo_sector','capacidad_inversion','urgencia','fit_estrategico')),
      v_creator,
      v_now,
      v_now,
      72
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger AFTER INSERT en leads
DROP TRIGGER IF EXISTS trg_lead_default_tasks ON public.leads;
CREATE TRIGGER trg_lead_default_tasks
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.create_default_lead_tasks();