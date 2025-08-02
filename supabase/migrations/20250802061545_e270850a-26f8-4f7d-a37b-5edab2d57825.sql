-- Critical Security Fixes Migration - Part 3
-- RLS Policy Security Hardening (without conflicts)

-- 1. Tighten overly permissive RLS policies
-- Fix contact_companies policies (currently allows all users to do everything)
DROP POLICY IF EXISTS "Users can create contact companies" ON public.contact_companies;
DROP POLICY IF EXISTS "Users can update contact companies" ON public.contact_companies;
DROP POLICY IF EXISTS "Users can delete contact companies" ON public.contact_companies;
DROP POLICY IF EXISTS "Users can view all contact companies" ON public.contact_companies;

CREATE POLICY "Users can create contact companies for their contacts" ON public.contact_companies
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = contact_companies.contact_id 
    AND contacts.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update contact companies for their contacts" ON public.contact_companies
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = contact_companies.contact_id 
    AND contacts.created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete contact companies for their contacts" ON public.contact_companies
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = contact_companies.contact_id 
    AND contacts.created_by = auth.uid()
  )
);

CREATE POLICY "Users can view contact companies for their contacts" ON public.contact_companies
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = contact_companies.contact_id 
    AND contacts.created_by = auth.uid()
  )
);

-- Fix contact_operations policies (currently allows all users to do everything)
DROP POLICY IF EXISTS "Users can manage contact operations" ON public.contact_operations;
DROP POLICY IF EXISTS "Users can view all contact operations" ON public.contact_operations;

CREATE POLICY "Users can manage contact operations for their contacts" ON public.contact_operations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = contact_operations.contact_id 
    AND contacts.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.operations 
    WHERE operations.id = contact_operations.operation_id 
    AND operations.created_by = auth.uid()
  )
);

-- Fix contact_tag_relations policies (currently allows all users to do everything)
DROP POLICY IF EXISTS "Users can manage contact tag relations" ON public.contact_tag_relations;
DROP POLICY IF EXISTS "Users can view all contact tag relations" ON public.contact_tag_relations;

CREATE POLICY "Users can manage contact tag relations for their contacts" ON public.contact_tag_relations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = contact_tag_relations.contact_id 
    AND contacts.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.contact_tags 
    WHERE contact_tags.id = contact_tag_relations.tag_id 
    AND contact_tags.created_by = auth.uid()
  )
);

-- 2. Strengthen user data isolation by adding validation triggers
CREATE OR REPLACE FUNCTION public.validate_user_ownership()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure created_by is set to current user for new records
  IF TG_OP = 'INSERT' THEN
    IF NEW.created_by IS NULL THEN
      NEW.created_by := auth.uid();
    ELSIF NEW.created_by != auth.uid() THEN
      -- Allow admins to create records for other users
      IF NOT (has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin')) THEN
        RAISE EXCEPTION 'Cannot create records for other users';
      END IF;
    END IF;
  END IF;
  
  -- Prevent changing ownership unless admin
  IF TG_OP = 'UPDATE' AND OLD.created_by != NEW.created_by THEN
    IF NOT (has_role_secure(auth.uid(), 'admin') OR has_role_secure(auth.uid(), 'superadmin')) THEN
      RAISE EXCEPTION 'Cannot change record ownership';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 3. Improve validation on commission_payments
CREATE OR REPLACE FUNCTION public.validate_commission_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure payment amount is positive
  IF NEW.payment_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be positive';
  END IF;
  
  -- Ensure commission exists and is in correct state
  IF NOT EXISTS (
    SELECT 1 FROM public.commissions 
    WHERE id = NEW.commission_id 
    AND status IN ('approved', 'pending')
  ) THEN
    RAISE EXCEPTION 'Cannot create payment for invalid or rejected commission';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 4. Add enhanced security logging for privilege changes
CREATE OR REPLACE FUNCTION public.log_privilege_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any privilege or role changes
  PERFORM public.enhanced_log_security_event(
    'privilege_change_detected',
    'high',
    format('Privilege change in table %s: %s', TG_TABLE_NAME, TG_OP),
    jsonb_build_object(
      'table_name', TG_TABLE_NAME,
      'operation', TG_OP,
      'old_data', to_jsonb(OLD),
      'new_data', to_jsonb(NEW),
      'user_id', auth.uid(),
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 5. Create validation function for sensitive data access
CREATE OR REPLACE FUNCTION public.validate_sensitive_data_access(
  table_name text,
  record_id uuid,
  access_type text DEFAULT 'read'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  is_allowed boolean := false;
  user_role app_role;
BEGIN
  -- Get user's highest role
  SELECT public.get_user_highest_role(auth.uid()) INTO user_role;
  
  -- Log the access attempt
  PERFORM public.enhanced_log_security_event(
    'sensitive_data_access_attempt',
    'medium',
    format('User attempted %s access to %s record %s', access_type, table_name, record_id),
    jsonb_build_object(
      'table_name', table_name,
      'record_id', record_id,
      'access_type', access_type,
      'user_role', user_role,
      'timestamp', now()
    )
  );
  
  -- Superadmins can access everything
  IF user_role = 'superadmin' THEN
    RETURN true;
  END IF;
  
  -- Admins can read most things
  IF user_role = 'admin' AND access_type = 'read' THEN
    RETURN true;
  END IF;
  
  -- For other cases, check ownership based on table
  CASE table_name
    WHEN 'companies' THEN
      SELECT EXISTS (
        SELECT 1 FROM public.companies 
        WHERE id = record_id 
        AND (created_by = auth.uid() OR owner_id = auth.uid())
      ) INTO is_allowed;
    
    WHEN 'contacts' THEN
      SELECT EXISTS (
        SELECT 1 FROM public.contacts 
        WHERE id = record_id 
        AND created_by = auth.uid()
      ) INTO is_allowed;
      
    WHEN 'leads' THEN
      SELECT EXISTS (
        SELECT 1 FROM public.leads 
        WHERE id = record_id 
        AND (created_by = auth.uid() OR assigned_to_id = auth.uid())
      ) INTO is_allowed;
      
    ELSE
      -- Default to deny access for unknown tables
      is_allowed := false;
  END CASE;
  
  RETURN is_allowed;
END;
$$;