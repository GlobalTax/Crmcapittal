-- Create foreign key constraint from buying_mandates.assigned_user_id to user_profiles.id
-- This allows us to properly join and select assigned user information

ALTER TABLE public.buying_mandates 
ADD CONSTRAINT buying_mandates_assigned_user_id_fkey 
FOREIGN KEY (assigned_user_id) REFERENCES public.user_profiles(id) ON DELETE SET NULL;