-- Create RPC functions for lead closure functionality

-- Function to create mandate from lead
CREATE OR REPLACE FUNCTION create_mandate_from_lead(
  lead_id UUID,
  mandate_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_mandate_id UUID;
  result JSONB;
BEGIN
  -- Generate new UUID for mandate
  new_mandate_id := gen_random_uuid();
  
  -- Create mandate record (assuming mandates table exists)
  INSERT INTO mandates (
    id,
    company_name,
    contact_name,
    contact_email,
    contact_phone,
    mandate_type,
    sector,
    ebitda_range,
    location,
    status,
    source_lead_id,
    created_from_lead,
    created_at,
    updated_at
  ) VALUES (
    new_mandate_id,
    mandate_data->>'company_name',
    mandate_data->>'contact_name',
    mandate_data->>'contact_email',
    mandate_data->>'contact_phone',
    mandate_data->>'mandate_type',
    mandate_data->>'sector',
    mandate_data->>'ebitda_range',
    mandate_data->>'location',
    mandate_data->>'status',
    lead_id,
    true,
    now(),
    now()
  );
  
  -- Return the new mandate ID
  result := jsonb_build_object('id', new_mandate_id);
  RETURN result;
END;
$$;

-- Function to create valuation from lead
CREATE OR REPLACE FUNCTION create_valuation_from_lead(
  lead_id UUID,
  valuation_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_valuation_id UUID;
  result JSONB;
BEGIN
  -- Generate new UUID for valuation
  new_valuation_id := gen_random_uuid();
  
  -- Create valuation record (assuming valuations table exists)
  INSERT INTO valuations (
    id,
    company_name,
    contact_name,
    contact_email,
    contact_phone,
    valuation_purpose,
    company_stage,
    revenue_range,
    status,
    source_lead_id,
    created_from_lead,
    created_at,
    updated_at
  ) VALUES (
    new_valuation_id,
    valuation_data->>'company_name',
    valuation_data->>'contact_name',
    valuation_data->>'contact_email',
    valuation_data->>'contact_phone',
    valuation_data->>'valuation_purpose',
    valuation_data->>'company_stage',
    valuation_data->>'revenue_range',
    valuation_data->>'status',
    lead_id,
    true,
    now(),
    now()
  );
  
  -- Return the new valuation ID
  result := jsonb_build_object('id', new_valuation_id);
  RETURN result;
END;
$$;