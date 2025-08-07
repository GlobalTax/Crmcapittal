-- Mejorar calendar_events con nuevos campos para CRM-integration
ALTER TABLE calendar_events 
  ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES operations(id),
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id),
  ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id),
  ADD COLUMN IF NOT EXISTS meeting_type TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS meeting_outcome TEXT,
  ADD COLUMN IF NOT EXISTS preparation_notes TEXT,
  ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS calendar_provider TEXT,
  ADD COLUMN IF NOT EXISTS external_event_id TEXT,
  ADD COLUMN IF NOT EXISTS travel_time_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_meeting_url TEXT,
  ADD COLUMN IF NOT EXISTS booking_link_id UUID,
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_rule TEXT,
  ADD COLUMN IF NOT EXISTS time_zone TEXT DEFAULT 'Europe/Madrid',
  ADD COLUMN IF NOT EXISTS reminder_minutes INTEGER DEFAULT 15,
  ADD COLUMN IF NOT EXISTS is_all_day BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private', -- private, public, confidential
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal'; -- low, normal, high, urgent

-- Crear tabla para booking links
CREATE TABLE IF NOT EXISTS booking_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  buffer_time_before INTEGER DEFAULT 0,
  buffer_time_after INTEGER DEFAULT 0,
  advance_notice_hours INTEGER DEFAULT 2,
  max_advance_days INTEGER DEFAULT 60,
  availability_schedule JSONB NOT NULL DEFAULT '{}',
  meeting_location TEXT,
  video_meeting_enabled BOOLEAN DEFAULT true,
  questions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  booking_limit_per_day INTEGER,
  slug TEXT UNIQUE NOT NULL,
  redirect_url TEXT,
  confirmation_message TEXT,
  requires_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_link_id UUID NOT NULL REFERENCES booking_links(id) ON DELETE CASCADE,
  event_id UUID REFERENCES calendar_events(id),
  booker_name TEXT NOT NULL,
  booker_email TEXT NOT NULL,
  booker_phone TEXT,
  company_name TEXT,
  booking_notes TEXT,
  answers JSONB DEFAULT '{}',
  status TEXT DEFAULT 'confirmed', -- confirmed, pending, cancelled, completed
  confirmation_token TEXT UNIQUE,
  cancelled_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para availability patterns
CREATE TABLE IF NOT EXISTS availability_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pattern_name TEXT NOT NULL,
  pattern_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para calendar analytics
CREATE TABLE IF NOT EXISTS calendar_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id UUID REFERENCES calendar_events(id),
  metric_type TEXT NOT NULL, -- meeting_scheduled, meeting_completed, no_show, rescheduled
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meeting_type TEXT,
  duration_minutes INTEGER,
  source TEXT, -- manual, booking_link, crm_integration
  outcome TEXT,
  follow_up_created BOOLEAN DEFAULT false,
  deal_progression BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para calendar integrations
CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL, -- google, outlook, apple
  account_email TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  calendar_id TEXT,
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'active', -- active, error, disabled
  sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para meeting templates
CREATE TABLE IF NOT EXISTS meeting_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  meeting_type TEXT NOT NULL,
  agenda_template TEXT,
  preparation_checklist JSONB DEFAULT '[]',
  follow_up_template TEXT,
  default_attendees JSONB DEFAULT '[]',
  location_template TEXT,
  questions JSONB DEFAULT '[]',
  is_shared BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON calendar_events(user_id, start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_company ON calendar_events(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_calendar_events_deal ON calendar_events(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_calendar_events_contact ON calendar_events(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_booking_links_slug ON booking_links(slug);
CREATE INDEX IF NOT EXISTS idx_booking_links_user ON booking_links(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bookings_link ON bookings(booking_link_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_calendar_analytics_user_date ON calendar_analytics(user_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user ON calendar_integrations(user_id);

-- RLS Policies
ALTER TABLE booking_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_templates ENABLE ROW LEVEL SECURITY;

-- Booking links policies
CREATE POLICY "Users can manage their booking links" ON booking_links
  FOR ALL USING (auth.uid() = user_id);

-- Bookings policies  
CREATE POLICY "Users can view bookings for their links" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM booking_links 
      WHERE booking_links.id = bookings.booking_link_id 
      AND booking_links.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update bookings for their links" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM booking_links 
      WHERE booking_links.id = bookings.booking_link_id 
      AND booking_links.user_id = auth.uid()
    )
  );

-- Availability patterns policies
CREATE POLICY "Users can manage their availability patterns" ON availability_patterns
  FOR ALL USING (auth.uid() = user_id);

-- Calendar analytics policies
CREATE POLICY "Users can manage their calendar analytics" ON calendar_analytics
  FOR ALL USING (auth.uid() = user_id);

-- Calendar integrations policies
CREATE POLICY "Users can manage their calendar integrations" ON calendar_integrations
  FOR ALL USING (auth.uid() = user_id);

-- Meeting templates policies
CREATE POLICY "Users can manage their meeting templates" ON meeting_templates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared meeting templates" ON meeting_templates
  FOR SELECT USING (is_shared = true OR auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_booking_links_updated_at BEFORE UPDATE ON booking_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_patterns_updated_at BEFORE UPDATE ON availability_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_integrations_updated_at BEFORE UPDATE ON calendar_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_templates_updated_at BEFORE UPDATE ON meeting_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar slugs únicos
CREATE OR REPLACE FUNCTION generate_booking_slug(base_title TEXT, user_id UUID)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
  counter INTEGER := 0;
  final_slug TEXT;
BEGIN
  -- Crear slug base
  slug := lower(regexp_replace(base_title, '[^a-zA-Z0-9\s]', '', 'g'));
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := trim(slug, '-');
  
  -- Si está vacío, usar default
  IF slug = '' THEN
    slug := 'meeting';
  END IF;
  
  final_slug := slug;
  
  -- Buscar slug único
  WHILE EXISTS (SELECT 1 FROM booking_links WHERE booking_links.slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Función para crear evento desde booking
CREATE OR REPLACE FUNCTION create_event_from_booking()
RETURNS TRIGGER AS $$
DECLARE
  booking_link booking_links%ROWTYPE;
  event_id UUID;
BEGIN
  -- Obtener datos del booking link
  SELECT * INTO booking_link FROM booking_links WHERE id = NEW.booking_link_id;
  
  -- Crear evento de calendario
  INSERT INTO calendar_events (
    user_id,
    title,
    description,
    start_date,
    end_date,
    event_type,
    location,
    meeting_type,
    contact_id,
    booking_link_id
  ) VALUES (
    booking_link.user_id,
    booking_link.title || ' - ' || NEW.booker_name,
    booking_link.description || E'\n\nContacto: ' || NEW.booker_email || 
    CASE WHEN NEW.company_name IS NOT NULL THEN E'\nEmpresa: ' || NEW.company_name ELSE '' END ||
    CASE WHEN NEW.booking_notes IS NOT NULL THEN E'\nNotas: ' || NEW.booking_notes ELSE '' END,
    NEW.created_at, -- Se debe calcular la fecha correcta basada en el booking
    NEW.created_at + INTERVAL '1 minute' * booking_link.duration_minutes,
    'meeting',
    booking_link.meeting_location,
    'client_meeting',
    NULL, -- TODO: buscar contact por email
    booking_link.id
  ) RETURNING id INTO event_id;
  
  -- Actualizar booking con event_id
  UPDATE bookings SET event_id = event_id WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear evento desde booking
CREATE TRIGGER create_event_from_booking_trigger
  AFTER INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION create_event_from_booking();

-- Función para analytics automático
CREATE OR REPLACE FUNCTION track_calendar_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO calendar_analytics (
      user_id,
      event_id,
      metric_type,
      meeting_type,
      duration_minutes,
      source
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'meeting_scheduled',
      NEW.meeting_type,
      EXTRACT(EPOCH FROM (NEW.end_date - NEW.start_date))/60,
      CASE WHEN NEW.booking_link_id IS NOT NULL THEN 'booking_link' ELSE 'manual' END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para analytics
CREATE TRIGGER track_calendar_event_trigger
  AFTER INSERT ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION track_calendar_event();