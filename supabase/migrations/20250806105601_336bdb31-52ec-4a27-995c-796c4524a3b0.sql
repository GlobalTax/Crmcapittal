-- Add missing columns to time_entries table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_entries' AND column_name = 'lead_id') THEN
        ALTER TABLE public.time_entries ADD COLUMN lead_id uuid;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_entries' AND column_name = 'mandate_id') THEN
        ALTER TABLE public.time_entries ADD COLUMN mandate_id uuid;
    END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_time_entries_lead') THEN
        ALTER TABLE public.time_entries 
        ADD CONSTRAINT fk_time_entries_lead FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_time_entries_mandate') THEN
        ALTER TABLE public.time_entries 
        ADD CONSTRAINT fk_time_entries_mandate FOREIGN KEY (mandate_id) REFERENCES public.buying_mandates(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Update RLS policies for time_entries
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

-- Fix lead_activities RLS policies (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can view lead activities" ON public.lead_activities;
DROP POLICY IF EXISTS "Users can create lead activities" ON public.lead_activities;

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