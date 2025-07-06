-- Add nif field to companies table for eInforma integration
ALTER TABLE public.companies 
ADD COLUMN nif TEXT;