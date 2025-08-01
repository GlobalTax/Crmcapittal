-- Create task notifications table for overdue task reminders
CREATE TABLE IF NOT EXISTS public.task_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  task_id UUID NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('planned', 'lead', 'valoracion')),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('overdue_task', 'task_reminder')),
  task_title TEXT NOT NULL,
  entity_name TEXT,
  entity_id UUID,
  message TEXT NOT NULL,
  days_overdue INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  email_sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.task_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own task notifications" 
ON public.task_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert task notifications" 
ON public.task_notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own task notifications" 
ON public.task_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to get overdue tasks for all users
CREATE OR REPLACE FUNCTION public.get_all_overdue_tasks()
RETURNS TABLE(
  task_id UUID,
  task_title TEXT,
  task_type TEXT,
  entity_id UUID,
  entity_name TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  owner_id UUID,
  owner_email TEXT,
  days_overdue INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Return combined overdue tasks from all tables
  RETURN QUERY
  WITH overdue_planned AS (
    SELECT 
      pt.id as task_id,
      pt.title as task_title,
      'planned'::text as task_type,
      pt.lead_id as entity_id,
      COALESCE(l.name, c.name, 'Sin asignar') as entity_name,
      pt.date::timestamp with time zone as due_date,
      pt.user_id as owner_id,
      au.email as owner_email,
      EXTRACT(DAYS FROM NOW() - pt.date::timestamp with time zone)::integer as days_overdue
    FROM planned_tasks pt
    LEFT JOIN leads l ON pt.lead_id::uuid = l.id
    LEFT JOIN contacts c ON pt.contact_id::uuid = c.id
    LEFT JOIN auth.users au ON pt.user_id = au.id
    WHERE pt.status = 'PENDING' AND pt.date < NOW()::date
  ),
  overdue_lead AS (
    SELECT 
      lt.id as task_id,
      lt.title as task_title,
      'lead'::text as task_type,
      lt.lead_id as entity_id,
      COALESCE(l.name, 'Lead sin nombre') as entity_name,
      lt.due_date as due_date,
      COALESCE(lt.assigned_to, lt.created_by) as owner_id,
      au.email as owner_email,
      EXTRACT(DAYS FROM NOW() - lt.due_date)::integer as days_overdue
    FROM lead_tasks lt
    LEFT JOIN leads l ON lt.lead_id = l.id
    LEFT JOIN auth.users au ON COALESCE(lt.assigned_to, lt.created_by) = au.id
    WHERE lt.status = 'pending' AND lt.due_date < NOW()
  ),
  overdue_valoracion AS (
    SELECT 
      vt.id as task_id,
      vt.title as task_title,
      'valoracion'::text as task_type,
      vt.valoracion_id as entity_id,
      'Valoración' as entity_name,
      vt.due_date as due_date,
      vt.assigned_to as owner_id,
      au.email as owner_email,
      EXTRACT(DAYS FROM NOW() - vt.due_date)::integer as days_overdue
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
$$;