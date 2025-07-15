-- Add highlighted and rod_order columns to operations table
ALTER TABLE public.operations 
ADD COLUMN highlighted boolean DEFAULT false,
ADD COLUMN rod_order integer;

-- Add highlighted and rod_order columns to leads table  
ALTER TABLE public.leads
ADD COLUMN highlighted boolean DEFAULT false,
ADD COLUMN rod_order integer;