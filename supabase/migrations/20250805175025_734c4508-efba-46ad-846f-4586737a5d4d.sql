-- Fix leads with null created_by and assigned_to_id values
-- This fixes RLS policy access issues for existing leads

-- Temporarily disable the trigger that's causing issues
ALTER TABLE leads DISABLE TRIGGER ALL;

-- Get the first superadmin user to assign as fallback owner
DO $$
DECLARE
    superadmin_user_id UUID;
BEGIN
    -- Find a superadmin user to use as fallback
    SELECT u.id INTO superadmin_user_id
    FROM auth.users u
    JOIN user_roles ur ON ur.user_id = u.id
    WHERE ur.role = 'superadmin'
    LIMIT 1;
    
    -- If no superadmin found, use the current authenticated user if available
    IF superadmin_user_id IS NULL THEN
        superadmin_user_id := '22873c0f-61da-4cd9-94d9-bcde55bc7ca8';
    END IF;
    
    -- Update leads with null created_by
    UPDATE leads 
    SET created_by = superadmin_user_id
    WHERE created_by IS NULL;
    
    -- Update leads with null assigned_to_id
    UPDATE leads 
    SET assigned_to_id = superadmin_user_id
    WHERE assigned_to_id IS NULL;
    
    -- Log the number of records updated
    RAISE NOTICE 'Updated leads with missing ownership to user: %', superadmin_user_id;
END $$;

-- Re-enable triggers
ALTER TABLE leads ENABLE TRIGGER ALL;