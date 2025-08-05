-- Fix the specific lead with null ownership
-- Set proper ownership for the lead causing issues

UPDATE leads 
SET 
  created_by = '22873c0f-61da-4cd9-94d9-bcde55bc7ca8',
  assigned_to_id = '22873c0f-61da-4cd9-94d9-bcde55bc7ca8',
  updated_at = now()
WHERE id = '01ad0416-b18a-4762-a2f5-21c2b714afb6' 
  AND (created_by IS NULL OR assigned_to_id IS NULL);