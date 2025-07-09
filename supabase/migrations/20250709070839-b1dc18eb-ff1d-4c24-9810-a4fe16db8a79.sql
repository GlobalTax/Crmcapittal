
-- Add assigned_user_id field to buying_mandates table
ALTER TABLE public.buying_mandates 
ADD COLUMN assigned_user_id UUID REFERENCES auth.users(id);

-- Create index for better performance on queries
CREATE INDEX idx_buying_mandates_assigned_user_id 
ON public.buying_mandates(assigned_user_id);

-- Set default assigned_user_id to created_by for existing mandates
UPDATE public.buying_mandates 
SET assigned_user_id = created_by 
WHERE assigned_user_id IS NULL;
