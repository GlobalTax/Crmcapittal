
-- Add contact_id column to deals table to link deals with contacts
ALTER TABLE public.deals ADD COLUMN contact_id UUID REFERENCES public.contacts(id);

-- Create index for better performance on contact lookups
CREATE INDEX idx_deals_contact_id ON public.deals(contact_id);

-- Update RLS policy to include contact relationship
CREATE POLICY "Users can view deals with contact access" 
  ON public.deals 
  FOR SELECT 
  USING (
    is_active = true AND (
      auth.uid() = created_by OR 
      EXISTS (
        SELECT 1 FROM public.contacts 
        WHERE contacts.id = deals.contact_id 
        AND contacts.created_by = auth.uid()
      )
    )
  );
