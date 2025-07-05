-- Create RLS policies for time_entries table
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Users can view their own time entries
CREATE POLICY "Users can view their own time entries"
ON public.time_entries
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own time entries
CREATE POLICY "Users can insert their own time entries"
ON public.time_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own time entries
CREATE POLICY "Users can update their own time entries"
ON public.time_entries
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own time entries
CREATE POLICY "Users can delete their own time entries"
ON public.time_entries
FOR DELETE
USING (auth.uid() = user_id);