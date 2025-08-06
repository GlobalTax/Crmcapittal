-- Step 1: Fix lead_activities RLS policies
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create lead activities for their leads" ON public.lead_activities;
DROP POLICY IF EXISTS "Users can view lead activities for their leads" ON public.lead_activities;

-- Create simplified and consistent RLS policies for lead_activities
CREATE POLICY "Users can create lead activities" 
ON public.lead_activities 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND 
  EXISTS (
    SELECT 1 FROM public.leads 
    WHERE leads.id = lead_activities.lead_id 
    AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
  )
);

CREATE POLICY "Users can view lead activities" 
ON public.lead_activities 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.leads 
    WHERE leads.id = lead_activities.lead_id 
    AND (leads.created_by = auth.uid() OR leads.assigned_to_id = auth.uid())
  ) OR 
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Step 2: Ensure time_entries has proper lead_id relationship
-- Check if lead_id column exists and add it if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_entries' 
    AND column_name = 'lead_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.time_entries ADD COLUMN lead_id UUID;
    
    -- Add foreign key constraint
    ALTER TABLE public.time_entries 
    ADD CONSTRAINT fk_time_entries_lead_id 
    FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;
    
    -- Create index for performance
    CREATE INDEX idx_time_entries_lead_id ON public.time_entries(lead_id);
  END IF;
END $$;