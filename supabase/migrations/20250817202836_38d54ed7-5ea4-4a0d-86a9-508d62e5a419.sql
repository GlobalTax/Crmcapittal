-- Mover el lead actual a la etapa "Cualificado" para el QA
UPDATE leads 
SET pipeline_stage_id = '8cf9a05f-2d6e-402f-a433-1b9078be9d09'
WHERE id = 'b6aa810c-c889-4b90-81a3-0358ed0ef462';