-- Fix: align return types for get_all_overdue_tasks to avoid 42804 (varchar vs text)
-- - Cast email, titles, and names to text
-- - Cast due_date columns to timestamptz consistently across UNION branches
-- - Preserve SECURITY DEFINER and search_path

CREATE OR REPLACE FUNCTION public.get_all_overdue_tasks()
RETURNS TABLE(
  task_id uuid,
  task_title text,
  task_type text,
  entity_id uuid,
  entity_name text,
  due_date timestamp with time zone,
  owner_id uuid,
  owner_email text,
  days_overdue integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Return combined overdue tasks from all tables with explicit casts to match declared types
  RETURN QUERY
  WITH overdue_planned AS (
    SELECT 
      pt.id AS task_id,
      pt.title::text AS task_title,
      'planned'::text AS task_type,
      pt.lead_id AS entity_id,
      COALESCE(l.name::text, c.name::text, 'Sin asignar'::text) AS entity_name,
      pt.date::timestamp with time zone AS due_date,
      pt.user_id AS owner_id,
      au.email::text AS owner_email,
      EXTRACT(DAYS FROM NOW() - pt.date::timestamp with time zone)::integer AS days_overdue
    FROM planned_tasks pt
    LEFT JOIN leads l ON pt.lead_id::uuid = l.id
    LEFT JOIN contacts c ON pt.contact_id::uuid = c.id
    LEFT JOIN auth.users au ON pt.user_id = au.id
    WHERE pt.status = 'PENDING' AND pt.date < NOW()::date
  ),
  overdue_lead AS (
    SELECT 
      lt.id AS task_id,
      lt.title::text AS task_title,
      'lead'::text AS task_type,
      lt.lead_id AS entity_id,
      COALESCE(l.name::text, 'Lead sin nombre'::text) AS entity_name,
      lt.due_date::timestamp with time zone AS due_date,
      COALESCE(lt.assigned_to, lt.created_by) AS owner_id,
      au.email::text AS owner_email,
      EXTRACT(DAYS FROM NOW() - lt.due_date::timestamp with time zone)::integer AS days_overdue
    FROM lead_tasks lt
    LEFT JOIN leads l ON lt.lead_id = l.id
    LEFT JOIN auth.users au ON COALESCE(lt.assigned_to, lt.created_by) = au.id
    WHERE lt.status = 'pending' AND lt.due_date < NOW()
  ),
  overdue_valoracion AS (
    SELECT 
      vt.id AS task_id,
      vt.title::text AS task_title,
      'valoracion'::text AS task_type,
      vt.valoracion_id AS entity_id,
      'Valoración'::text AS entity_name,
      vt.due_date::timestamp with time zone AS due_date,
      vt.assigned_to AS owner_id,
      au.email::text AS owner_email,
      EXTRACT(DAYS FROM NOW() - vt.due_date::timestamp with time zone)::integer AS days_overdue
    FROM valoracion_tasks vt
    LEFT JOIN auth.users au ON vt.assigned_to = au.id
    WHERE vt.due_date < NOW() AND (vt.completed IS NULL OR vt.completed = false)
  )
  SELECT * FROM overdue_planned
  UNION ALL
  SELECT * FROM overdue_lead
  UNION ALL
  SELECT * FROM overdue_valoracion
  ORDER BY days_overdue DESC;
END;
$function$;

COMMENT ON FUNCTION public.get_all_overdue_tasks() IS 'Devuelve todas las tareas vencidas (planned, lead, valoracion) tipadas de forma consistente (text/timestamptz) y RLS-friendly.';