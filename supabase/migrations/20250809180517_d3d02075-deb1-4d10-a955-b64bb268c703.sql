-- Actualizar función para crear tareas también en tabla legacy public.lead_tasks
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
  BEGIN
    v_assignee := NEW.assigned_to_id;
  EXCEPTION WHEN undefined_column THEN
    v_assignee := v_creator;
  END;
  v_assignee := COALESCE(v_assignee, v_creator);

  -- Helper para insertar en ambas tablas si no existen
  PERFORM 1; -- placeholder

  -- whatsapp
  IF NOT EXISTS (SELECT 1 FROM public.lead_task_engine WHERE lead_id = NEW.id AND type = 'whatsapp') THEN
    INSERT INTO public.lead_task_engine (lead_id,type,title,description,due_date,assigned_to,priority,status,dependencies,metadata,created_by,created_at,updated_at,sla_hours)
    VALUES (NEW.id,'whatsapp','WhatsApp de contacto',NULL,v_now,v_assignee,'medium','open',ARRAY[]::text[],jsonb_build_object('plantilla','whatsapp_touch_v1','link_agenda',true),v_creator,v_now,v_now,0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.lead_tasks WHERE lead_id = NEW.id AND title = 'WhatsApp de contacto') THEN
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (NEW.id,'WhatsApp de contacto',NULL,v_now,'medium','pending',v_assignee,v_creator,v_now,v_now);
  END IF;

  -- llamada
  IF NOT EXISTS (SELECT 1 FROM public.lead_task_engine WHERE lead_id = NEW.id AND type = 'llamada') THEN
    INSERT INTO public.lead_task_engine (lead_id,type,title,description,due_date,assigned_to,priority,status,dependencies,metadata,created_by,created_at,updated_at,sla_hours)
    VALUES (NEW.id,'llamada','Llamada telefónica al lead',NULL,v_now + interval '1 day',v_assignee,'medium','open',ARRAY[]::text[],jsonb_build_object('script','call_script_v1','objetivo','calificar necesidad'),v_creator,v_now,v_now,24);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.lead_tasks WHERE lead_id = NEW.id AND title = 'Llamada telefónica al lead') THEN
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (NEW.id,'Llamada telefónica al lead',NULL,v_now + interval '1 day','medium','pending',v_assignee,v_creator,v_now,v_now);
  END IF;

  -- videollamada
  IF NOT EXISTS (SELECT 1 FROM public.lead_task_engine WHERE lead_id = NEW.id AND type = 'videollamada') THEN
    INSERT INTO public.lead_task_engine (lead_id,type,title,description,due_date,assigned_to,priority,status,dependencies,metadata,created_by,created_at,updated_at,sla_hours)
    VALUES (NEW.id,'videollamada','Agendar video llamada',NULL,v_now,v_assignee,'high','open',ARRAY[]::text[],jsonb_build_object('plataforma','Teams/Zoom','link_auto',true,'asistentes_sugeridos', jsonb_build_array('owner','analista'),'duracion','30m','deps_sugeridas', jsonb_build_array('whatsapp','llamada')),v_creator,v_now,v_now,0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.lead_tasks WHERE lead_id = NEW.id AND title = 'Agendar video llamada') THEN
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (NEW.id,'Agendar video llamada',NULL,v_now,'high','pending',v_assignee,v_creator,v_now,v_now);
  END IF;

  -- informe_mercado
  IF NOT EXISTS (SELECT 1 FROM public.lead_task_engine WHERE lead_id = NEW.id AND type = 'informe_mercado') THEN
    INSERT INTO public.lead_task_engine (lead_id,type,title,description,due_date,assigned_to,priority,status,dependencies,metadata,created_by,created_at,updated_at,sla_hours)
    VALUES (NEW.id,'informe_mercado','Crear informe de mercado',NULL,v_now + interval '2 day',v_assignee,'medium','open',ARRAY[]::text[],jsonb_build_object('formato','PDF','estructura', jsonb_build_array('tamaño mercado','tendencias','competidores','múltiplos','SWOT','fuentes'),'storage_path','', 'review_status','pending'),v_creator,v_now,v_now,48);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.lead_tasks WHERE lead_id = NEW.id AND title = 'Crear informe de mercado') THEN
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (NEW.id,'Crear informe de mercado',NULL,v_now + interval '2 day','medium','pending',v_assignee,v_creator,v_now,v_now);
  END IF;

  -- preguntas_reunion
  IF NOT EXISTS (SELECT 1 FROM public.lead_task_engine WHERE lead_id = NEW.id AND type = 'preguntas_reunion') THEN
    INSERT INTO public.lead_task_engine (lead_id,type,title,description,due_date,assigned_to,priority,status,dependencies,metadata,created_by,created_at,updated_at,sla_hours)
    VALUES (NEW.id,'preguntas_reunion','Preparar preguntas para reunión',NULL,v_now + interval '1 day',v_assignee,'high','open',ARRAY[]::text[],jsonb_build_object('bloques', jsonb_build_array('objetivos','dolores','finanzas','decisión','siguiente_paso'), 'deps_sugeridas', jsonb_build_array('informe_mercado')),v_creator,v_now,v_now,24);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.lead_tasks WHERE lead_id = NEW.id AND title = 'Preparar preguntas para reunión') THEN
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (NEW.id,'Preparar preguntas para reunión',NULL,v_now + interval '1 day','high','pending',v_assignee,v_creator,v_now,v_now);
  END IF;

  -- datos_sabi
  IF NOT EXISTS (SELECT 1 FROM public.lead_task_engine WHERE lead_id = NEW.id AND type = 'datos_sabi') THEN
    INSERT INTO public.lead_task_engine (lead_id,type,title,description,due_date,assigned_to,priority,status,dependencies,metadata,created_by,created_at,updated_at,sla_hours)
    VALUES (NEW.id,'datos_sabi','Descargar datos SABI/eInforma',NULL,v_now,v_assignee,'high','open',ARRAY[]::text[],jsonb_build_object('fuente','einforma','campos', jsonb_build_array('facturacion','ebitda','deuda','plantilla')),v_creator,v_now,v_now,0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.lead_tasks WHERE lead_id = NEW.id AND title = 'Descargar datos SABI/eInforma') THEN
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (NEW.id,'Descargar datos SABI/eInforma',NULL,v_now,'high','pending',v_assignee,v_creator,v_now,v_now);
  END IF;

  -- balances_4y
  IF NOT EXISTS (SELECT 1 FROM public.lead_task_engine WHERE lead_id = NEW.id AND type = 'balances_4y') THEN
    INSERT INTO public.lead_task_engine (lead_id,type,title,description,due_date,assigned_to,priority,status,dependencies,metadata,created_by,created_at,updated_at,sla_hours)
    VALUES (NEW.id,'balances_4y','Incorporar balances 4 años y cuenta de explotación',NULL,v_now + interval '2 day',v_assignee,'high','open',ARRAY['datos_sabi']::text[],jsonb_build_object('origen','excel/pdf','funcion_parser','process-excel-valoracion'),v_creator,v_now,v_now,48);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.lead_tasks WHERE lead_id = NEW.id AND title = 'Incorporar balances 4 años y cuenta de explotación') THEN
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (NEW.id,'Incorporar balances 4 años y cuenta de explotación',NULL,v_now + interval '2 day','high','pending',v_assignee,v_creator,v_now,v_now);
  END IF;

  -- valoracion_inicial
  IF NOT EXISTS (SELECT 1 FROM public.lead_task_engine WHERE lead_id = NEW.id AND type = 'valoracion_inicial') THEN
    INSERT INTO public.lead_task_engine (lead_id,type,title,description,due_date,assigned_to,priority,status,dependencies,metadata,created_by,created_at,updated_at,sla_hours)
    VALUES (NEW.id,'valoracion_inicial','Enviar valoración inicial gratuita',NULL,v_now + interval '1 day',v_assignee,'high','open',ARRAY[]::text[],jsonb_build_object('plantilla_pdf','valuation_light','multiples_fuente','einforma/sabi','deps_sugeridas', jsonb_build_array('informe_mercado','balances_4y')),v_creator,v_now,v_now,24);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.lead_tasks WHERE lead_id = NEW.id AND title = 'Enviar valoración inicial gratuita') THEN
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (NEW.id,'Enviar valoración inicial gratuita',NULL,v_now + interval '1 day','high','pending',v_assignee,v_creator,v_now,v_now);
  END IF;

  -- perfilar_oportunidad
  IF NOT EXISTS (SELECT 1 FROM public.lead_task_engine WHERE lead_id = NEW.id AND type = 'perfilar_oportunidad') THEN
    INSERT INTO public.lead_task_engine (lead_id,type,title,description,due_date,assigned_to,priority,status,dependencies,metadata,created_by,created_at,updated_at,sla_hours)
    VALUES (NEW.id,'perfilar_oportunidad','Perfilar la oportunidad',NULL,v_now + interval '3 day',v_assignee,'medium','open',ARRAY['informe_mercado','balances_4y']::text[],jsonb_build_object('score_campos', jsonb_build_array('atractivo_sector','capacidad_inversion','urgencia','fit_estrategico')),v_creator,v_now,v_now,72);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.lead_tasks WHERE lead_id = NEW.id AND title = 'Perfilar la oportunidad') THEN
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (NEW.id,'Perfilar la oportunidad',NULL,v_now + interval '3 day','medium','pending',v_assignee,v_creator,v_now,v_now);
  END IF;

  RETURN NEW;
END;
$$;