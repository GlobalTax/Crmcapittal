-- Añadir columna extra para almacenar progreso del checklist y otros datos del lead
ALTER TABLE leads 
ADD COLUMN extra JSONB DEFAULT '{}';