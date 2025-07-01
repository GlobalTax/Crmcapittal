
-- First, let's check if time_entries table exists and create RLS policies
-- Enable RLS on time_entries table if not already enabled
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can create their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON public.time_entries;

-- Create comprehensive RLS policies for time_entries
CREATE POLICY "Users can view their own time entries" 
  ON public.time_entries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own time entries" 
  ON public.time_entries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries" 
  ON public.time_entries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries" 
  ON public.time_entries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Also create policies for planned_tasks if they don't exist
DROP POLICY IF EXISTS "Users can view their own planned tasks" ON public.planned_tasks;
DROP POLICY IF EXISTS "Users can create their own planned tasks" ON public.planned_tasks;
DROP POLICY IF EXISTS "Users can update their own planned tasks" ON public.planned_tasks;
DROP POLICY IF EXISTS "Users can delete their own planned tasks" ON public.planned_tasks;

CREATE POLICY "Users can view their own planned tasks" 
  ON public.planned_tasks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own planned tasks" 
  ON public.planned_tasks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planned tasks" 
  ON public.planned_tasks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planned tasks" 
  ON public.planned_tasks 
  FOR DELETE 
  USING (auth.uid() = user_id);
