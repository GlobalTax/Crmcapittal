-- Clean up orphaned target_contacts before creating foreign key
DELETE FROM public.target_contacts
WHERE target_company_id NOT IN (
  SELECT id FROM public.target_companies
);

-- Now create the foreign key
ALTER TABLE public.target_contacts 
DROP CONSTRAINT IF EXISTS target_contacts_target_company_id_fkey;

ALTER TABLE public.target_contacts 
ADD CONSTRAINT target_contacts_target_company_id_fkey 
FOREIGN KEY (target_company_id) 
REFERENCES public.target_companies(id) 
ON DELETE CASCADE;