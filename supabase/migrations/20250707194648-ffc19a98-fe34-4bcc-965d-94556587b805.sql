-- Insert predefined document templates for document generation
INSERT INTO public.document_templates (name, template_type, description, content, variables, created_by) VALUES
(
  'NDA Estándar',
  'nda',
  'Acuerdo de confidencialidad estándar para operaciones M&A',
  '{
    "title": "ACUERDO DE CONFIDENCIALIDAD",
    "content": "En {{location}}, a {{date}}, entre {{advisor_name}}, con email {{advisor_email}}, actuando como asesor financiero (el \"Asesor\"), y {{client_name}}, representante de {{company_name}}, con email {{client_email}} (el \"Cliente\").\n\nPor el presente documento, las partes acuerdan:\n\n1. OBJETO: El Cliente desea compartir información confidencial relacionada con {{deal_description}} por un valor estimado de {{deal_value}} EUR.\n\n2. CONFIDENCIALIDAD: El Asesor se compromete a mantener la más estricta confidencialidad sobre toda la información recibida.\n\n3. DURACIÓN: Este acuerdo tendrá una duración de 2 años desde la fecha de firma.\n\n4. SECTOR: La información se refiere a una empresa del sector {{sector}}.\n\nFirmado en {{location}}, {{date}}\n\n{{advisor_name}}\nAsesor Financiero\n\n{{client_name}}\n{{company_name}}"
  }',
  '{
    "client_name": "Nombre del cliente",
    "company_name": "Nombre de la empresa",
    "client_email": "Email del cliente",
    "advisor_name": "Nombre del asesor",
    "advisor_email": "Email del asesor",
    "deal_description": "Descripción de la operación",
    "deal_value": "Valor de la operación",
    "sector": "Sector de actividad",
    "location": "Madrid",
    "date": "Fecha actual"
  }',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Propuesta de Honorarios',
  'proposal',
  'Propuesta estándar de honorarios para servicios de asesoramiento',
  '{
    "title": "PROPUESTA DE HONORARIOS",
    "content": "{{advisor_name}}\nAsesor Financiero\n{{advisor_email}}\n\n{{date}}\n\n{{client_name}}\n{{company_name}}\n{{client_email}}\n\nEstimado/a {{client_name}},\n\nNos complace presentar nuestra propuesta de honorarios para prestar servicios de asesoramiento financiero en la operación de {{deal_description}}.\n\nDETALLES DE LA OPERACIÓN:\n- Empresa: {{company_name}}\n- Sector: {{sector}}\n- Valor estimado: {{deal_value}} EUR\n- Tipo de operación: {{deal_type}}\n\nHONORARIOS PROPUESTOS:\n- Honorarios de éxito: {{commission_percentage}}% sobre el valor final de la transacción\n- Mínimo garantizado: {{minimum_fee}} EUR\n- Gastos: A convenir según desarrollo de la operación\n\nSERVICIOS INCLUIDOS:\n- Valoración de la empresa\n- Preparación de documentación comercial\n- Búsqueda y selección de compradores\n- Negociación y cierre de la operación\n\nVigencia de la propuesta: 30 días\n\nQuedamos a su disposición para cualquier aclaración.\n\nAtentamente,\n\n{{advisor_name}}\nAsesor Financiero"
  }',
  '{
    "client_name": "Nombre del cliente",
    "company_name": "Nombre de la empresa",
    "client_email": "Email del cliente",
    "advisor_name": "Nombre del asesor",
    "advisor_email": "Email del asesor",
    "deal_description": "Descripción de la operación",
    "deal_value": "Valor de la operación",
    "deal_type": "Tipo de operación",
    "sector": "Sector de actividad",
    "commission_percentage": "Porcentaje de comisión",
    "minimum_fee": "Honorarios mínimos",
    "date": "Fecha actual"
  }',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Mandato de Representación',
  'mandate',
  'Mandato estándar para representación en operaciones M&A',
  '{
    "title": "MANDATO DE REPRESENTACIÓN",
    "content": "En {{location}}, a {{date}}\n\nENTRE:\n{{company_name}}, representada por {{client_name}}, con email {{client_email}} (el \"Mandante\")\n\nY\n\n{{advisor_name}}, con email {{advisor_email}} (el \"Mandatario\")\n\nSe formaliza el presente MANDATO DE REPRESENTACIÓN:\n\n1. OBJETO: El Mandante otorga al Mandatario representación para la venta/adquisición de {{deal_description}}.\n\n2. CARACTERÍSTICAS DE LA OPERACIÓN:\n- Empresa: {{company_name}}\n- Sector: {{sector}}\n- Valor estimado: {{deal_value}} EUR\n- Tipo: {{deal_type}}\n\n3. FACULTADES: El Mandatario queda facultado para:\n- Buscar compradores/vendedores potenciales\n- Negociar términos y condiciones\n- Representar al Mandante en todas las gestiones\n\n4. DURACIÓN: {{mandate_duration}} meses desde la firma\n\n5. EXCLUSIVIDAD: {{exclusivity_clause}}\n\n6. HONORARIOS: Según propuesta adjunta\n\n7. GASTOS: Los gastos ordinarios corren por cuenta del Mandatario\n\nFirmado en {{location}}, {{date}}\n\nEL MANDANTE\n{{client_name}}\n{{company_name}}\n\nEL MANDATARIO\n{{advisor_name}}\nAsesor Financiero"
  }',
  '{
    "client_name": "Nombre del cliente",
    "company_name": "Nombre de la empresa",
    "client_email": "Email del cliente",
    "advisor_name": "Nombre del asesor",
    "advisor_email": "Email del asesor",
    "deal_description": "Descripción de la operación",
    "deal_value": "Valor de la operación",
    "deal_type": "Tipo de operación",
    "sector": "Sector de actividad",
    "mandate_duration": "Duración del mandato",
    "exclusivity_clause": "Cláusula de exclusividad",
    "location": "Madrid",
    "date": "Fecha actual"
  }',
  (SELECT id FROM auth.users LIMIT 1)
);