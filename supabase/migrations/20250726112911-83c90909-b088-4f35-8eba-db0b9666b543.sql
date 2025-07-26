-- Fix remaining security issues - Phase 2

-- Fix function search paths for all existing functions
CREATE OR REPLACE FUNCTION public.update_contact_last_interaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.contacts 
  SET last_interaction_date = NEW.interaction_date
  WHERE id = NEW.contact_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_manager_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Cuando se crea un manager, asignar rol admin
  IF TG_OP = 'INSERT' AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- Cuando se elimina un manager, quitar rol admin (si no es superadmin)
  IF TG_OP = 'DELETE' AND OLD.user_id IS NOT NULL THEN
    DELETE FROM public.user_roles 
    WHERE user_id = OLD.user_id 
    AND role = 'admin'::public.app_role
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = OLD.user_id 
      AND role = 'superadmin'::public.app_role
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.log_contact_activity_unified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Fix more functions with search path
CREATE OR REPLACE FUNCTION public.log_security_event(p_event_type text, p_severity text, p_description text, p_metadata jsonb DEFAULT '{}'::jsonb, p_user_id uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_logs (
    event_type,
    severity,
    description,
    metadata,
    user_id,
    ip_address
  ) VALUES (
    p_event_type,
    p_severity,
    p_description,
    p_metadata,
    p_user_id,
    inet_client_addr()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Add missing RLS policies for tables that need them
-- Fix security_logs table
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security logs" ON public.security_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "System can create security logs" ON public.security_logs
  FOR INSERT WITH CHECK (true);