-- Add lifecycle_stage and roles columns to contacts table
ALTER TABLE public.contacts 
ADD COLUMN lifecycle_stage text DEFAULT 'lead' 
  CHECK (lifecycle_stage IN ('lead', 'cliente', 'suscriptor', 'proveedor')),
ADD COLUMN roles text[] DEFAULT '{}';

-- Create GIN index for fast array searches on roles
CREATE INDEX idx_contacts_roles ON public.contacts USING GIN (roles);

-- Update existing contacts to have 'lead' as default lifecycle_stage
UPDATE public.contacts 
SET lifecycle_stage = 'lead' 
WHERE lifecycle_stage IS NULL;