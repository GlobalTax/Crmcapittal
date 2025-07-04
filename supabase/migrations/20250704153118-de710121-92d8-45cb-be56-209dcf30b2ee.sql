-- Create negocio_activities table for tracking business deal activities
CREATE TABLE public.negocio_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  negocio_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'document', 'note', 'milestone', 'task', 'update')),
  title TEXT NOT NULL,
  description TEXT,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint to deals table (if it exists, otherwise negocios)
ALTER TABLE public.negocio_activities 
ADD CONSTRAINT fk_negocio_activities_negocio 
FOREIGN KEY (negocio_id) REFERENCES public.deals(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.negocio_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view negocio activities" 
ON public.negocio_activities 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create negocio activities" 
ON public.negocio_activities 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own negocio activities" 
ON public.negocio_activities 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own negocio activities" 
ON public.negocio_activities 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create trigger for updated_at
CREATE TRIGGER update_negocio_activities_updated_at
BEFORE UPDATE ON public.negocio_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_negocio_activities_negocio_id ON public.negocio_activities(negocio_id);
CREATE INDEX idx_negocio_activities_activity_date ON public.negocio_activities(activity_date DESC);
CREATE INDEX idx_negocio_activities_created_by ON public.negocio_activities(created_by);