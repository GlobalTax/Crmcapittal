-- Drop the tables if they exist (from previous failed migration)
DROP TABLE IF EXISTS public.lead_files CASCADE;
DROP TABLE IF EXISTS public.lead_tasks CASCADE; 
DROP TABLE IF EXISTS public.lead_notes CASCADE;

-- Create lead_notes table
CREATE TABLE public.lead_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  note text NOT NULL,
  note_type text DEFAULT 'general',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create lead_tasks table
CREATE TABLE public.lead_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date timestamp with time zone,
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Create lead_files table
CREATE TABLE public.lead_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  content_type text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lead_notes (using assigned_to_id instead of created_by)
CREATE POLICY "Users can view lead notes" ON public.lead_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_notes.lead_id 
      AND leads.assigned_to_id = auth.uid()
    )
  );

CREATE POLICY "Users can create lead notes" ON public.lead_notes
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_notes.lead_id 
      AND leads.assigned_to_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own lead notes" ON public.lead_notes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own lead notes" ON public.lead_notes
  FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for lead_tasks
CREATE POLICY "Users can view lead tasks" ON public.lead_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_tasks.lead_id 
      AND leads.assigned_to_id = auth.uid()
    ) OR auth.uid() = assigned_to
  );

CREATE POLICY "Users can create lead tasks" ON public.lead_tasks
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_tasks.lead_id 
      AND leads.assigned_to_id = auth.uid()
    )
  );

CREATE POLICY "Users can update lead tasks they created or are assigned to" ON public.lead_tasks
  FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete their own lead tasks" ON public.lead_tasks
  FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for lead_files
CREATE POLICY "Users can view lead files" ON public.lead_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_files.lead_id 
      AND leads.assigned_to_id = auth.uid()
    )
  );

CREATE POLICY "Users can create lead files" ON public.lead_files
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by AND
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_files.lead_id 
      AND leads.assigned_to_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own lead files" ON public.lead_files
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Create triggers for updated_at
CREATE TRIGGER update_lead_notes_updated_at
  BEFORE UPDATE ON public.lead_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_lead_tasks_updated_at
  BEFORE UPDATE ON public.lead_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_lead_files_updated_at
  BEFORE UPDATE ON public.lead_files
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();