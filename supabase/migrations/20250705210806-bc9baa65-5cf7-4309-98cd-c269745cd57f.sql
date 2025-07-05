-- Create trigger for lifecycle stage automation: Lead → Cliente
CREATE OR REPLACE FUNCTION public.handle_lifecycle_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  -- When lifecycle_stage changes to 'cliente', create activity log
  IF OLD.lifecycle_stage != NEW.lifecycle_stage AND NEW.lifecycle_stage = 'cliente' THEN
    INSERT INTO public.contact_activities (
      contact_id,
      activity_type,
      title,
      description,
      activity_data,
      created_by
    ) VALUES (
      NEW.id,
      'lifecycle_stage_change',
      'Contacto convertido a Cliente',
      'El contacto ha sido convertido de ' || OLD.lifecycle_stage || ' a cliente',
      jsonb_build_object(
        'previous_stage', OLD.lifecycle_stage,
        'new_stage', NEW.lifecycle_stage,
        'automated', true
      ),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_lifecycle_stage_change
  AFTER UPDATE OF lifecycle_stage ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.handle_lifecycle_stage_change();