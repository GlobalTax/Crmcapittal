-- Create function to automatically create commissions when deals are closed as won
CREATE OR REPLACE FUNCTION public.create_commission_from_deal()
RETURNS TRIGGER AS $$
DECLARE
  deal_row RECORD;
  collaborator_record RECORD;
  commission_percentage NUMERIC := 5.0; -- Default 5%
  commission_amount NUMERIC;
  source_name TEXT;
BEGIN
  -- Only process if deal stage changed to 'Won' or closed_won
  IF TG_OP = 'UPDATE' AND OLD.stage_id != NEW.stage_id THEN
    -- Get stage name to check if it's Won
    SELECT s.name INTO source_name
    FROM stages s 
    WHERE s.id = NEW.stage_id;
    
    -- Only create commission for Won deals
    IF source_name = 'Won' THEN
      -- Get deal details
      SELECT 
        d.deal_name,
        d.deal_value,
        d.deal_owner,
        d.sector,
        d.lead_source,
        c.name as company_name
      INTO deal_row
      FROM deals d
      LEFT JOIN companies c ON d.company_name = c.name
      WHERE d.id = NEW.id;
      
      -- Try to find collaborator based on deal owner or lead source
      SELECT * INTO collaborator_record
      FROM collaborators
      WHERE is_active = true
      AND (
        user_id = NEW.deal_owner
        OR name ILIKE '%' || COALESCE(deal_row.lead_source, '') || '%'
      )
      ORDER BY 
        CASE WHEN user_id = NEW.deal_owner THEN 1 ELSE 2 END,
        created_at DESC
      LIMIT 1;
      
      -- Calculate commission amount
      commission_amount := COALESCE(NEW.deal_value, 0) * (commission_percentage / 100);
      
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
        CASE WHEN collaborator_record.id IS NULL THEN NEW.deal_owner ELSE NULL END,
        CASE WHEN collaborator_record.id IS NOT NULL THEN 'collaborator' ELSE 'employee' END,
        COALESCE(collaborator_record.name, 'Employee'),
        commission_amount,
        commission_percentage,
        'deal',
        deal_row.deal_name || ' - ' || COALESCE(deal_row.company_name, 'Sin empresa'),
        'pending',
        jsonb_build_object(
          'deal_value', NEW.deal_value,
          'commission_percentage', commission_percentage,
          'calculation_method', 'automatic',
          'deal_sector', deal_row.sector,
          'lead_source', deal_row.lead_source,
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

-- Create trigger on deals table
DROP TRIGGER IF EXISTS trigger_create_commission_from_deal ON deals;
CREATE TRIGGER trigger_create_commission_from_deal
  AFTER UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION public.create_commission_from_deal();

-- Also create trigger on negocios table (which seems to be the actual table used)
DROP TRIGGER IF EXISTS trigger_create_commission_from_negocio ON negocios;
CREATE TRIGGER trigger_create_commission_from_negocio
  AFTER UPDATE ON negocios
  FOR EACH ROW
  EXECUTE FUNCTION public.create_commission_from_deal();