-- Actualizar la etapa "Cualificado" con checklist de QA
UPDATE pipeline_stages 
SET stage_config = jsonb_build_object(
  'checklist', jsonb_build_array(
    jsonb_build_object(
      'key', 'validar-email',
      'label', 'Validar email', 
      'required', true
    ),
    jsonb_build_object(
      'key', 'registrar-primera-llamada',
      'label', 'Registrar primera llamada',
      'required', true
    ),
    jsonb_build_object(
      'key', 'anotar-nota-interna', 
      'label', 'Anotar nota interna',
      'required', false
    )
  )
)
WHERE id = '8cf9a05f-2d6e-402f-a433-1b9078be9d09' AND name = 'Cualificado';