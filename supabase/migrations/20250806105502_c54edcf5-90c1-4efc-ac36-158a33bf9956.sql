-- Add missing columns to time_entries table
ALTER TABLE public.time_entries 
ADD COLUMN IF NOT EXISTS lead_id uuid,
ADD COLUMN IF NOT EXISTS mandate_id uuid;

-- Add foreign key constraints
ALTER TABLE public.time_entries 
ADD CONSTRAINT fk_time_entries_lead FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_time_entries_mandate FOREIGN KEY (mandate_id) REFERENCES public.buying_mandates(id) ON DELETE SET NULL;

-- Update RLS policies for time_entries to include the new relationships
DROP POLICY IF EXISTS "Users can view their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can create their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON public.time_entries;

CREATE POLICY "Users can view their own time entries" ON public.time_entries
FOR SELECT USING (
  auth.uid() = user_id OR
  (lead_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.leads WHERE id = time_entries.lead_id AND created_by = auth.uid()
  )) OR
  (mandate_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.buying_mandates WHERE id = time_entries.mandate_id AND created_by = auth.uid()
  )) OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Users can create their own time entries" ON public.time_entries
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries" ON public.time_entries
FOR UPDATE USING (
  auth.uid() = user_id OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Users can delete their own time entries" ON public.time_entries
FOR DELETE USING (
  auth.uid() = user_id OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Fix lead_activities RLS policies (403 error)
DROP POLICY IF EXISTS "Users can view lead activities" ON public.lead_activities;

CREATE POLICY "Users can view lead activities" ON public.lead_activities
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.leads 
    WHERE id = lead_activities.lead_id 
    AND (
      created_by = auth.uid() OR 
      has_role_secure(auth.uid(), 'admin'::app_role) OR 
      has_role_secure(auth.uid(), 'superadmin'::app_role)
    )
  )
);

CREATE POLICY "Users can create lead activities" ON public.lead_activities
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads 
    WHERE id = lead_activities.lead_id 
    AND created_by = auth.uid()
  ) OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Ensure planned_tasks table exists with proper structure
CREATE TABLE IF NOT EXISTS public.planned_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  user_id uuid NOT NULL,
  date date NOT NULL,
  estimated_duration integer, -- in minutes
  status text NOT NULL DEFAULT 'PENDING',
  lead_id uuid,
  contact_id uuid,
  operation_id uuid,
  mandate_id uuid,
  target_company_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS for planned_tasks if not exists
ALTER TABLE public.planned_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own planned tasks" ON public.planned_tasks;

CREATE POLICY "Users can manage their own planned tasks" ON public.planned_tasks
FOR ALL USING (
  auth.uid() = user_id OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);