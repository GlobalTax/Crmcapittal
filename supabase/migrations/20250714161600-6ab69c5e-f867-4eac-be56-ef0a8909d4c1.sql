-- First, let's add the missing created_by column to the leads table
ALTER TABLE public.leads ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Create new RLS policies that allow users to create and manage their own leads
CREATE POLICY "Users can create leads" 
  ON public.leads 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view leads they created, are assigned to, or if admin" 
  ON public.leads 
  FOR SELECT 
  USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to_id OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can update leads they created, are assigned to, or if admin" 
  ON public.leads 
  FOR UPDATE 
  USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to_id OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can delete leads they created or if admin" 
  ON public.leads 
  FOR DELETE 
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );