-- Create ContactHistory table
CREATE TABLE public.contact_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id UUID NOT NULL,
  mandate_id UUID NOT NULL,
  fecha_contacto TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  medio TEXT NOT NULL CHECK (medio IN ('email', 'telefono')),
  resultado TEXT NOT NULL DEFAULT 'pendiente' CHECK (resultado IN ('pendiente', 'positivo', 'negativo')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create contact history entries" 
ON public.contact_history 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view contact history entries" 
ON public.contact_history 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM buying_mandates 
    WHERE buying_mandates.id = contact_history.mandate_id 
    AND buying_mandates.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can update their own contact history entries" 
ON public.contact_history 
FOR UPDATE 
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Create function to update timestamps
CREATE TRIGGER update_contact_history_updated_at
BEFORE UPDATE ON public.contact_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();