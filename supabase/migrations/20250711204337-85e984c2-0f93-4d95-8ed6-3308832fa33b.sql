-- Fix the commission creation function to work with actual table structure
CREATE OR REPLACE FUNCTION public.create_commission_from_deal()
RETURNS TRIGGER AS $$
DECLARE
  collaborator_record RECORD;
  commission_percentage NUMERIC := 5.0; -- Default 5%
  commission_amount NUMERIC;
  stage_name TEXT;
  company_name TEXT;
BEGIN
  -- Only process if deal stage changed
  IF TG_OP = 'UPDATE' AND (OLD.stage_id IS DISTINCT FROM NEW.stage_id) THEN
    -- Get stage name to check if it's Won
    SELECT s.name INTO stage_name
    FROM stages s 
    WHERE s.id = NEW.stage_id;
    
    -- Only create commission for Won deals
    IF stage_name = 'Won' THEN
      -- Get company name if exists
      SELECT c.name INTO company_name
      FROM companies c 
      WHERE c.id = NEW.company_id;
      
      -- Try to find collaborator based on deal creator or other criteria
      SELECT * INTO collaborator_record
      FROM collaborators
      WHERE is_active = true
      AND (
        user_id = NEW.created_by
        OR name ILIKE '%' || COALESCE(NEW.fuente_lead, '') || '%'
      )
      ORDER BY 
        CASE WHEN user_id = NEW.created_by THEN 1 ELSE 2 END,
        created_at DESC
      LIMIT 1;
      
      -- Calculate commission amount
      commission_amount := COALESCE(NEW.valor_negocio, 0) * (commission_percentage / 100);
      
      -- Create commission
      INSERT INTO commissions (
        deal_id,
        collaborator_id,
        employee_id,
        recipient_type,
        recipient_name,
        commission_amount,
        commission_percentage,
        source_type,
        source_name,
        status,
        calculation_details,
        payment_due_date
      ) VALUES (
        NEW.id,
        collaborator_record.id,
        CASE WHEN collaborator_record.id IS NULL THEN NEW.created_by ELSE NULL END,
        CASE WHEN collaborator_record.id IS NOT NULL THEN 'collaborator' ELSE 'employee' END,
        COALESCE(collaborator_record.name, 'Employee'),
        commission_amount,
        commission_percentage,
        'deal',
        NEW.nombre_negocio || CASE WHEN company_name IS NOT NULL THEN ' - ' || company_name ELSE '' END,
        'pending',
        jsonb_build_object(
          'deal_value', NEW.valor_negocio,
          'commission_percentage', commission_percentage,
          'calculation_method', 'automatic',
          'deal_sector', NEW.sector,
          'lead_source', NEW.fuente_lead,
          'deal_currency', NEW.moneda,
          'created_at', now()
        ),
        now() + interval '30 days'
      );
      
      RAISE NOTICE 'Commission created automatically for deal %: % EUR (% %)', 
        NEW.id, commission_amount, commission_percentage, '%';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;