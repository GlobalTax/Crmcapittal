-- Fix the auto_initiate_winback trigger to use correct enum values
-- The trigger was checking for 'LOST' status which is not valid in the lead_status enum

CREATE OR REPLACE FUNCTION auto_initiate_winback()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo si cambia a status DISQUALIFIED (equivalent to LOST) y no tenía winback previo
  IF NEW.status = 'DISQUALIFIED' 
     AND (OLD.status != 'DISQUALIFIED' OR OLD.status IS NULL)
     AND NEW.winback_stage = 'cold' 
     AND NEW.lost_reason IS NOT NULL
  THEN
    -- Iniciar secuencia winback automáticamente
    -- Check if initiate_winback_sequence function exists before calling
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'initiate_winback_sequence') THEN
      PERFORM initiate_winback_sequence(NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;