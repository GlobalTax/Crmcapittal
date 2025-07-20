
-- Create pipeline stages table
CREATE TABLE public.pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default pipeline stages
INSERT INTO public.pipeline_stages (name, stage_order, color) VALUES
('Pipeline', 1, '#6B7280'),
('Cualificado', 2, '#3B82F6'),
('Propuesta', 3, '#F59E0B'),
('Negociación', 4, '#EF4444'),
('Ganado', 5, '#10B981'),
('Perdido', 6, '#6B7280');

-- Add new fields to leads table to match Pipedrive functionality
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS deal_value NUMERIC DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS estimated_close_date DATE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS pipeline_stage_id UUID REFERENCES public.pipeline_stages(id);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_followed BOOLEAN DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_activity_type TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS next_activity_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS won_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lost_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lost_reason TEXT;

-- Create lead activities table for complete activity tracking
CREATE TABLE public.lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'call', 'meeting', 'email', 'task', 'note', 'stage_change'
  title TEXT NOT NULL,
  description TEXT,
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration_minutes INTEGER,
  outcome TEXT, -- 'completed', 'no_answer', 'busy', 'rescheduled'
  next_action TEXT,
  next_action_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  activity_data JSONB DEFAULT '{}'::jsonb,
  points_awarded INTEGER DEFAULT 0
);

-- Create lead notes table
CREATE TABLE public.lead_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  note_type TEXT DEFAULT 'general',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead tasks table
CREATE TABLE public.lead_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead files table
CREATE TABLE public.lead_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  content_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for pipeline_stages (read-only for all authenticated users)
CREATE POLICY "Users can view pipeline stages" ON public.pipeline_stages
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS policies for lead_activities
CREATE POLICY "Users can view lead activities" ON public.lead_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_activities.lead_id 
      AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
    )
  );

CREATE POLICY "Users can create lead activities" ON public.lead_activities
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_activities.lead_id 
      AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
    )
  );

-- RLS policies for lead_notes
CREATE POLICY "Users can view lead notes" ON public.lead_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_notes.lead_id 
      AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
    )
  );

CREATE POLICY "Users can create lead notes" ON public.lead_notes
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_notes.lead_id 
      AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own lead notes" ON public.lead_notes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own lead notes" ON public.lead_notes
  FOR DELETE USING (auth.uid() = created_by);

-- RLS policies for lead_tasks
CREATE POLICY "Users can view lead tasks" ON public.lead_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_tasks.lead_id 
      AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
    ) OR auth.uid() = assigned_to
  );

CREATE POLICY "Users can create lead tasks" ON public.lead_tasks
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_tasks.lead_id 
      AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
    )
  );

CREATE POLICY "Users can update lead tasks" ON public.lead_tasks
  FOR UPDATE USING (
    auth.uid() = created_by OR auth.uid() = assigned_to
  );

-- RLS policies for lead_files
CREATE POLICY "Users can view lead files" ON public.lead_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_files.lead_id 
      AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
    )
  );

CREATE POLICY "Users can upload lead files" ON public.lead_files
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by AND
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_files.lead_id 
      AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete their own lead files" ON public.lead_files
  FOR DELETE USING (auth.uid() = uploaded_by);
