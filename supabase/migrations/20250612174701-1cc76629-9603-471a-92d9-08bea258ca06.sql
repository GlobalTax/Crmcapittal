
-- Añadir el campo project_name a la tabla operations
ALTER TABLE public.operations 
ADD COLUMN project_name text;

-- Añadir el campo teaser_url si no existe
ALTER TABLE public.operations 
ADD COLUMN teaser_url text;
