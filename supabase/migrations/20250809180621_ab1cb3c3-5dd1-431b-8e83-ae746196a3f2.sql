-- Backfill: crear plantillas en tabla legacy para leads que no las tengan aún
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT l.id as lead_id, COALESCE(l.assigned_to_id, l.created_by) as assignee
    FROM public.leads l
    WHERE NOT EXISTS (
      SELECT 1 FROM public.lead_tasks t
      WHERE t.lead_id = l.id AND t.title = 'WhatsApp de contacto'
    )
  ) LOOP
    -- Variables comunes
    PERFORM 1;
    -- WhatsApp de contacto
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (r.lead_id,'WhatsApp de contacto',NULL,now(),'medium','pending',r.assignee,auth.uid(),now(),now());

    -- Llamada telefónica al lead
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (r.lead_id,'Llamada telefónica al lead',NULL,now() + interval '1 day','medium','pending',r.assignee,auth.uid(),now(),now());

    -- Agendar video llamada
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (r.lead_id,'Agendar video llamada',NULL,now(),'high','pending',r.assignee,auth.uid(),now(),now());

    -- Crear informe de mercado
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (r.lead_id,'Crear informe de mercado',NULL,now() + interval '2 day','medium','pending',r.assignee,auth.uid(),now(),now());

    -- Preparar preguntas para reunión
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (r.lead_id,'Preparar preguntas para reunión',NULL,now() + interval '1 day','high','pending',r.assignee,auth.uid(),now(),now());

    -- Descargar datos SABI/eInforma
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (r.lead_id,'Descargar datos SABI/eInforma',NULL,now(),'high','pending',r.assignee,auth.uid(),now(),now());

    -- Incorporar balances 4 años y cuenta de explotación
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (r.lead_id,'Incorporar balances 4 años y cuenta de explotación',NULL,now() + interval '2 day','high','pending',r.assignee,auth.uid(),now(),now());

    -- Enviar valoración inicial gratuita
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (r.lead_id,'Enviar valoración inicial gratuita',NULL,now() + interval '1 day','high','pending',r.assignee,auth.uid(),now(),now());

    -- Perfilar la oportunidad
    INSERT INTO public.lead_tasks (lead_id,title,description,due_date,priority,status,assigned_to,created_by,created_at,updated_at)
    VALUES (r.lead_id,'Perfilar la oportunidad',NULL,now() + interval '3 day','medium','pending',r.assignee,auth.uid(),now(),now());
  END LOOP;
END $$;