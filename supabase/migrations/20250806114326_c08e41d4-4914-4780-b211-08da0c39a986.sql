-- Agregar campos para relacionar eventos con leads y mandatos
ALTER TABLE calendar_events 
ADD COLUMN lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
ADD COLUMN mandate_id uuid REFERENCES buying_mandates(id) ON DELETE SET NULL;

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_calendar_events_lead_id ON calendar_events(lead_id);
CREATE INDEX idx_calendar_events_mandate_id ON calendar_events(mandate_id);