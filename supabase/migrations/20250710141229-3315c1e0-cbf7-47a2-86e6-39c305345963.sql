-- Create company_activities table
CREATE TABLE public.company_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_data JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create company_notes table
CREATE TABLE public.company_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  note TEXT NOT NULL,
  note_type TEXT DEFAULT 'general'::text,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create company_files table
CREATE TABLE public.company_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  content_type TEXT,
  file_size BIGINT,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.company_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_activities
CREATE POLICY "Users can create company activities" ON public.company_activities
  FOR INSERT WITH CHECK (auth.uid() = created_by AND EXISTS (
    SELECT 1 FROM companies WHERE companies.id = company_activities.company_id 
    AND companies.created_by = auth.uid()
  ));

CREATE POLICY "Users can view company activities" ON public.company_activities
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM companies WHERE companies.id = company_activities.company_id 
    AND companies.created_by = auth.uid()
  ));

-- RLS Policies for company_notes
CREATE POLICY "Users can create company notes" ON public.company_notes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view all company notes" ON public.company_notes
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own company notes" ON public.company_notes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own company notes" ON public.company_notes
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for company_files
CREATE POLICY "Users can create company files" ON public.company_files
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can view company files" ON public.company_files
  FOR SELECT USING ((auth.uid() = uploaded_by) OR (EXISTS (
    SELECT 1 FROM companies WHERE companies.id = company_files.company_id 
    AND companies.created_by = auth.uid()
  )));

CREATE POLICY "Users can delete their own company files" ON public.company_files
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Triggers for automatic activity logging
CREATE OR REPLACE FUNCTION public.log_company_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  -- Handle INSERT (company created)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.company_activities (
      company_id,
      activity_type,
      title,
      description,
      activity_data,
      created_by
    ) VALUES (
      NEW.id,
      'company_created',
      'Empresa creada',
      'Se ha creado una nueva empresa en el sistema',
      jsonb_build_object(
        'company_name', NEW.name,
        'company_status', NEW.company_status,
        'company_type', NEW.company_type
      ),
      NEW.created_by
    );
    RETURN NEW;
  END IF;

  -- Handle UPDATE (company modified)
  IF TG_OP = 'UPDATE' THEN
    DECLARE
      changes jsonb := '{}'::jsonb;
      change_description text := '';
    BEGIN
      -- Track name changes
      IF OLD.name != NEW.name THEN
        changes := changes || jsonb_build_object('name', jsonb_build_object('from', OLD.name, 'to', NEW.name));
        change_description := change_description || 'Nombre cambiado. ';
      END IF;
      
      -- Track status changes
      IF OLD.company_status != NEW.company_status THEN
        changes := changes || jsonb_build_object('status', jsonb_build_object('from', OLD.company_status, 'to', NEW.company_status));
        change_description := change_description || 'Estado cambiado. ';
      END IF;
      
      -- Only log if there are actual changes
      IF changes != '{}'::jsonb THEN
        INSERT INTO public.company_activities (
          company_id,
          activity_type,
          title,
          description,
          activity_data,
          created_by
        ) VALUES (
          NEW.id,
          'company_updated',
          'Empresa actualizada',
          TRIM(change_description),
          jsonb_build_object(
            'changes', changes,
            'updated_by', auth.uid()
          ),
          auth.uid()
        );
      END IF;
    END;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$function$;

-- Create trigger for company activities
CREATE TRIGGER log_company_activity_trigger
  AFTER INSERT OR UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.log_company_activity();

-- Function to log company note activities
CREATE OR REPLACE FUNCTION public.log_company_note_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.company_activities (
      company_id,
      activity_type,
      title,
      description,
      activity_data,
      created_by
    ) VALUES (
      NEW.company_id,
      'note_added',
      'Nota añadida',
      LEFT(NEW.note, 100) || CASE WHEN LENGTH(NEW.note) > 100 THEN '...' ELSE '' END,
      jsonb_build_object(
        'note_type', NEW.note_type,
        'full_note', NEW.note
      ),
      NEW.created_by
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

-- Create trigger for company note activities
CREATE TRIGGER log_company_note_activity_trigger
  AFTER INSERT ON public.company_notes
  FOR EACH ROW EXECUTE FUNCTION public.log_company_note_activity();

-- Function to update file timestamps
CREATE OR REPLACE FUNCTION public.update_company_file_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Create trigger for file timestamp updates
CREATE TRIGGER update_company_file_updated_at_trigger
  BEFORE UPDATE ON public.company_files
  FOR EACH ROW EXECUTE FUNCTION public.update_company_file_updated_at();

-- Add indexes for better performance
CREATE INDEX idx_company_activities_company_id ON public.company_activities(company_id);
CREATE INDEX idx_company_activities_created_at ON public.company_activities(created_at DESC);
CREATE INDEX idx_company_notes_company_id ON public.company_notes(company_id);
CREATE INDEX idx_company_files_company_id ON public.company_files(company_id);