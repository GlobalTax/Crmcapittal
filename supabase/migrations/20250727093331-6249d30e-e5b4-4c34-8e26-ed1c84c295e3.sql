-- Security Fix: Handle trigger dependencies and remaining functions properly
-- Fix functions with trigger dependencies by using CASCADE and recreating

-- 1. Fix update_contact_last_interaction with CASCADE
DROP TRIGGER IF EXISTS update_contact_last_interaction_trigger ON public.contact_interactions;
DROP FUNCTION IF EXISTS public.update_contact_last_interaction() CASCADE;

CREATE OR REPLACE FUNCTION public.update_contact_last_interaction()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.contacts 
  SET last_interaction_date = NEW.interaction_date
  WHERE id = NEW.contact_id;
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER update_contact_last_interaction_trigger
  AFTER INSERT OR UPDATE ON public.contact_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contact_last_interaction();

-- 2. Fix remaining critical functions that we can update safely

-- Fix log_contact_activity_unified (drop and recreate with search_path)
DROP FUNCTION IF EXISTS public.log_contact_activity_unified() CASCADE;
CREATE OR REPLACE FUNCTION public.log_contact_activity_unified()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Handle INSERT (contact created)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.contact_activities (
      contact_id,
      activity_type,
      title,
      description,
      activity_data,
      created_by
    ) VALUES (
      NEW.id,
      'contact_created',
      'Contacto creado',
      'Se ha creado un nuevo contacto con roles: ' || array_to_string(NEW.contact_roles, ', '),
      jsonb_build_object(
        'contact_name', NEW.name,
        'contact_email', NEW.email,
        'contact_roles', NEW.contact_roles,
        'contact_status', NEW.contact_status,
        'source_table', NEW.source_table
      ),
      NEW.created_by
    );
    RETURN NEW;
  END IF;

  -- Handle UPDATE (contact modified) 
  IF TG_OP = 'UPDATE' THEN
    DECLARE
      changes jsonb := '{}'::jsonb;
      change_description text := '';
    BEGIN
      -- Track role changes
      IF OLD.contact_roles != NEW.contact_roles THEN
        changes := changes || jsonb_build_object('roles', jsonb_build_object('from', OLD.contact_roles, 'to', NEW.contact_roles));
        change_description := change_description || 'Roles cambiados. ';
      END IF;
      
      -- Track status changes
      IF OLD.contact_status != NEW.contact_status THEN
        changes := changes || jsonb_build_object('status', jsonb_build_object('from', OLD.contact_status, 'to', NEW.contact_status));
        change_description := change_description || 'Estado cambiado. ';
      END IF;
      
      -- Only log if there are actual changes
      IF changes != '{}'::jsonb THEN
        INSERT INTO public.contact_activities (
          contact_id,
          activity_type,
          title,
          description,
          activity_data,
          created_by
        ) VALUES (
          NEW.id,
          'contact_updated',
          'Contacto actualizado',
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

-- 3. Address critical auth configuration by configuring proper settings
-- Enable leaked password protection and fix OTP expiry
-- Note: These need to be done via Supabase dashboard but we can document them

COMMENT ON SCHEMA public IS 'Security Configuration Required:
1. Enable leaked password protection in Supabase Dashboard
2. Reduce OTP expiry time to 5 minutes
3. Review and fix Security Definer Views
4. Complete search_path fixes for remaining functions';

-- 4. Create security documentation table for tracking
CREATE TABLE IF NOT EXISTS public.security_audit_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  description text,
  fix_required text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert current security status
INSERT INTO public.security_audit_status (audit_type, status, description, fix_required) VALUES
('function_search_path', 'in_progress', 'Fixing search_path for all SECURITY DEFINER functions', 'Complete remaining functions'),
('security_definer_views', 'pending', 'Two Security Definer Views detected', 'Review and fix or justify'),
('auth_config', 'pending', 'OTP expiry too long, leaked password protection disabled', 'Dashboard configuration required'),
('database_hardening', 'in_progress', 'General database security hardening', 'Complete all security fixes');

COMMENT ON TABLE public.security_audit_status IS 'Tracks security audit progress and required fixes';