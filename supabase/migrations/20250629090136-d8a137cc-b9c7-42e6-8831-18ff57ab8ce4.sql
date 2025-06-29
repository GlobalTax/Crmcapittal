
-- Create enum for task status
CREATE TYPE public.task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');

-- Create planned_tasks table
CREATE TABLE public.planned_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  estimated_duration INTEGER, -- Duration in minutes
  status task_status NOT NULL DEFAULT 'PENDING',
  
  -- Relations with other modules
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  operation_id UUID REFERENCES public.operations(id) ON DELETE SET NULL,
  target_company_id UUID REFERENCES public.target_companies(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add planned_task_id to time_entries table to link them
ALTER TABLE public.time_entries 
ADD COLUMN planned_task_id UUID REFERENCES public.planned_tasks(id) ON DELETE SET NULL;

-- Create indexes for better performance (removed the problematic date function index)
CREATE INDEX idx_planned_tasks_user_date ON public.planned_tasks(user_id, date);
CREATE INDEX idx_planned_tasks_status ON public.planned_tasks(status);
CREATE INDEX idx_time_entries_planned_task ON public.time_entries(planned_task_id);
CREATE INDEX idx_time_entries_user_start_time ON public.time_entries(user_id, start_time);

-- Enable RLS on planned_tasks
ALTER TABLE public.planned_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for planned_tasks
CREATE POLICY "Users can manage their own planned tasks"
  ON public.planned_tasks
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all planned tasks"
  ON public.planned_tasks
  FOR SELECT
  USING (public.is_admin_user());

-- Update trigger for planned_tasks
CREATE TRIGGER update_planned_tasks_updated_at
  BEFORE UPDATE ON public.planned_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enhanced trigger for time_entries to update planned task status
CREATE OR REPLACE FUNCTION public.update_planned_task_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- When a time entry is started (end_time is null), mark planned task as IN_PROGRESS
  IF NEW.planned_task_id IS NOT NULL AND NEW.end_time IS NULL THEN
    UPDATE public.planned_tasks
    SET status = 'IN_PROGRESS', updated_at = now()
    WHERE id = NEW.planned_task_id AND status = 'PENDING';
  END IF;
  
  -- When a time entry is completed (end_time is set), check if we should mark task as COMPLETED
  IF NEW.planned_task_id IS NOT NULL AND NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
    -- Only mark as completed if there are no other active time entries for this task
    IF NOT EXISTS (
      SELECT 1 FROM public.time_entries 
      WHERE planned_task_id = NEW.planned_task_id 
      AND end_time IS NULL 
      AND id != NEW.id
    ) THEN
      UPDATE public.planned_tasks
      SET status = 'COMPLETED', updated_at = now()
      WHERE id = NEW.planned_task_id AND status = 'IN_PROGRESS';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_planned_task_status_trigger
  AFTER INSERT OR UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_planned_task_status();
