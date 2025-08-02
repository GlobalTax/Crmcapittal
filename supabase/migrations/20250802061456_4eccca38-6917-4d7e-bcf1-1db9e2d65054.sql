-- Critical Security Fixes Migration - Part 2
-- RLS Policy Security Hardening and Validation

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

-- Apply validation trigger to key tables (only if triggers don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'validate_company_ownership') THEN
    CREATE TRIGGER validate_company_ownership
      BEFORE INSERT OR UPDATE ON public.companies
      FOR EACH ROW EXECUTE FUNCTION validate_user_ownership();
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'validate_contact_ownership') THEN
    CREATE TRIGGER validate_contact_ownership
      BEFORE INSERT OR UPDATE ON public.contacts
      FOR EACH ROW EXECUTE FUNCTION validate_user_ownership();
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'validate_lead_ownership') THEN
    CREATE TRIGGER validate_lead_ownership
      BEFORE INSERT OR UPDATE ON public.leads
      FOR EACH ROW EXECUTE FUNCTION validate_user_ownership();
  END IF;
END $$;

-- 3. Add enhanced security logging for privilege changes
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

-- Apply to user_roles table for monitoring (only if trigger doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'log_user_role_changes') THEN
    CREATE TRIGGER log_user_role_changes
      AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
      FOR EACH ROW EXECUTE FUNCTION log_privilege_change();
  END IF;
END $$;

-- 4. Add constraint to prevent orphaned user data (only if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'user_roles_user_id_not_null'
  ) THEN
    ALTER TABLE public.user_roles 
    ADD CONSTRAINT user_roles_user_id_not_null 
    CHECK (user_id IS NOT NULL);
  END IF;
END $$;

-- 5. Secure the rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system functions and admins can manage rate limits
CREATE POLICY "System can manage rate limits" ON public.rate_limits
FOR ALL USING (
  has_role_secure(auth.uid(), 'superadmin') OR 
  current_setting('role', true) = 'service_role'
);

-- 6. Improve validation on commission_payments
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

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'validate_commission_payment_trigger') THEN
    CREATE TRIGGER validate_commission_payment_trigger
      BEFORE INSERT OR UPDATE ON public.commission_payments
      FOR EACH ROW EXECUTE FUNCTION validate_commission_payment();
  END IF;
END $$;