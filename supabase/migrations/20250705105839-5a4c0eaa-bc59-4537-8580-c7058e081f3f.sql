-- Seed 4 deals for testing (one per stage)
-- First get the stage IDs
DO $$
DECLARE
    lead_stage_id UUID;
    progress_stage_id UUID;
    won_stage_id UUID;
    lost_stage_id UUID;
    test_user_id UUID;
BEGIN
    -- Get stage IDs
    SELECT id INTO lead_stage_id FROM public.stages WHERE name = 'Lead';
    SELECT id INTO progress_stage_id FROM public.stages WHERE name = 'In Progress';
    SELECT id INTO won_stage_id FROM public.stages WHERE name = 'Won';
    SELECT id INTO lost_stage_id FROM public.stages WHERE name = 'Lost';
    
    -- Get a test user ID (first user in system)
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    -- Insert seed deals
    INSERT INTO public.negocios (
        nombre_negocio, valor_negocio, moneda, tipo_negocio, stage_id, 
        prioridad, created_by, descripcion
    ) VALUES 
    ('New Lead Deal', 50000, 'EUR', 'venta', lead_stage_id, 'media', test_user_id, 'Potential client from website inquiry'),
    ('Ongoing Project', 120000, 'EUR', 'venta', progress_stage_id, 'alta', test_user_id, 'Currently in negotiation phase'),
    ('Closed Success', 85000, 'EUR', 'venta', won_stage_id, 'alta', test_user_id, 'Successfully closed deal'),
    ('Lost Opportunity', 75000, 'EUR', 'venta', lost_stage_id, 'baja', test_user_id, 'Lost to competitor')
    ON CONFLICT DO NOTHING;
END $$;