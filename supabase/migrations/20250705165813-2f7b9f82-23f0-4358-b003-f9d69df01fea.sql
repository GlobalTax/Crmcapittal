-- Fix RLS policies for time_entries and stages tables

-- 1. Fix time_entries RLS policies - change from {public} to {authenticated} role
DROP POLICY IF EXISTS "Users can view their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can create their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON public.time_entries;

-- Create improved RLS policies for time_entries with {authenticated} role
CREATE POLICY "Authenticated users can view their own time entries" 
  ON public.time_entries 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create their own time entries" 
  ON public.time_entries 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own time entries" 
  ON public.time_entries 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own time entries" 
  ON public.time_entries 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Improve stages RLS policies for better security
-- Keep the existing permissive view policy but make it more specific
DROP POLICY IF EXISTS "Users can view all stages" ON public.stages;

-- Create more secure policy - stages should be viewable by authenticated users
CREATE POLICY "Authenticated users can view active stages" 
  ON public.stages 
  FOR SELECT 
  TO authenticated
  USING (is_active = true);

-- Keep admin management policy as is (it's already correct)