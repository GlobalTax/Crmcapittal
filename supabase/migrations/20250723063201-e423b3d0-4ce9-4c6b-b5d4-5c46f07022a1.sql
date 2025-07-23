
-- Add missing columns to lead_activities table to match the LeadActivity interface
ALTER TABLE public.lead_activities 
ADD COLUMN IF NOT EXISTS activity_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
ADD COLUMN IF NOT EXISTS outcome TEXT,
ADD COLUMN IF NOT EXISTS next_action TEXT,
ADD COLUMN IF NOT EXISTS next_action_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_lead_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lead_activities_updated_at_trigger
    BEFORE UPDATE ON public.lead_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_activities_updated_at();

-- Update existing records to have proper titles
UPDATE public.lead_activities 
SET title = CASE 
    WHEN activity_type = 'call' THEN 'Llamada telefónica'
    WHEN activity_type = 'email' THEN 'Email enviado'
    WHEN activity_type = 'meeting' THEN 'Reunión'
    WHEN activity_type = 'note' THEN 'Nota añadida'
    WHEN activity_type = 'task' THEN 'Tarea creada'
    ELSE 'Actividad registrada'
END
WHERE title = '' OR title IS NULL;
