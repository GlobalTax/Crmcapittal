-- Tabla para métricas de propuestas
CREATE TABLE public.proposal_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'download', 'share', 'email_open', 'email_click', 'section_view')),
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  location TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para tracking de emails de propuestas
CREATE TABLE public.proposal_email_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  email_subject TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  tracking_pixel_url TEXT,
  click_tracking_urls JSONB DEFAULT '{}',
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para sesiones de visualización
CREATE TABLE public.proposal_view_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  visitor_id TEXT,
  email TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_duration_seconds INTEGER DEFAULT 0,
  pages_viewed INTEGER DEFAULT 0,
  sections_viewed JSONB DEFAULT '[]',
  engagement_score NUMERIC(3,2) DEFAULT 0.00,
  conversion_action TEXT,
  user_agent TEXT,
  ip_address INET,
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para estadísticas agregadas de propuestas
CREATE TABLE public.proposal_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  total_views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  avg_duration_seconds NUMERIC(10,2) DEFAULT 0.00,
  bounce_rate NUMERIC(3,2) DEFAULT 0.00,
  conversion_rate NUMERIC(3,2) DEFAULT 0.00,
  email_opens INTEGER DEFAULT 0,
  email_clicks INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  engagement_score NUMERIC(3,2) DEFAULT 0.00,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para optimizar consultas
CREATE INDEX idx_proposal_analytics_proposal_id ON public.proposal_analytics(proposal_id);
CREATE INDEX idx_proposal_analytics_event_type ON public.proposal_analytics(event_type);
CREATE INDEX idx_proposal_analytics_created_at ON public.proposal_analytics(created_at);
CREATE INDEX idx_proposal_email_tracking_proposal_id ON public.proposal_email_tracking(proposal_id);
CREATE INDEX idx_proposal_email_tracking_recipient ON public.proposal_email_tracking(recipient_email);
CREATE INDEX idx_proposal_view_sessions_proposal_id ON public.proposal_view_sessions(proposal_id);
CREATE INDEX idx_proposal_view_sessions_session_id ON public.proposal_view_sessions(session_id);
CREATE INDEX idx_proposal_stats_proposal_id ON public.proposal_stats(proposal_id);

-- Trigger para actualizar estadísticas automáticamente
CREATE OR REPLACE FUNCTION update_proposal_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar estadísticas cuando se registra un nuevo evento analítico
  INSERT INTO public.proposal_stats (proposal_id)
  VALUES (NEW.proposal_id)
  ON CONFLICT (proposal_id) DO NOTHING;
  
  -- Recalcular estadísticas básicas
  UPDATE public.proposal_stats 
  SET 
    total_views = (
      SELECT COUNT(*) 
      FROM public.proposal_analytics 
      WHERE proposal_id = NEW.proposal_id AND event_type = 'view'
    ),
    unique_views = (
      SELECT COUNT(DISTINCT session_id) 
      FROM public.proposal_analytics 
      WHERE proposal_id = NEW.proposal_id AND event_type = 'view'
    ),
    downloads = (
      SELECT COUNT(*) 
      FROM public.proposal_analytics 
      WHERE proposal_id = NEW.proposal_id AND event_type = 'download'
    ),
    shares = (
      SELECT COUNT(*) 
      FROM public.proposal_analytics 
      WHERE proposal_id = NEW.proposal_id AND event_type = 'share'
    ),
    last_viewed_at = (
      SELECT MAX(created_at) 
      FROM public.proposal_analytics 
      WHERE proposal_id = NEW.proposal_id AND event_type = 'view'
    ),
    updated_at = now()
  WHERE proposal_id = NEW.proposal_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_proposal_stats
  AFTER INSERT ON public.proposal_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_stats();

-- Trigger para actualizar timestamps
CREATE TRIGGER update_proposal_email_tracking_updated_at
  BEFORE UPDATE ON public.proposal_email_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_proposal_view_sessions_updated_at
  BEFORE UPDATE ON public.proposal_view_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_proposal_stats_updated_at
  BEFORE UPDATE ON public.proposal_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.proposal_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_email_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_view_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_stats ENABLE ROW LEVEL SECURITY;

-- Policies para proposal_analytics
CREATE POLICY "Users can create analytics for their proposals" ON public.proposal_analytics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE id = proposal_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view analytics for their proposals" ON public.proposal_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE id = proposal_id AND created_by = auth.uid()
    ) OR 
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

-- Policies para proposal_email_tracking
CREATE POLICY "Users can manage email tracking for their proposals" ON public.proposal_email_tracking
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE id = proposal_id AND created_by = auth.uid()
    ) OR 
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

-- Policies para proposal_view_sessions
CREATE POLICY "Users can view sessions for their proposals" ON public.proposal_view_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE id = proposal_id AND created_by = auth.uid()
    ) OR 
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

CREATE POLICY "System can create view sessions" ON public.proposal_view_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update view sessions" ON public.proposal_view_sessions
  FOR UPDATE USING (true);

-- Policies para proposal_stats
CREATE POLICY "Users can view stats for their proposals" ON public.proposal_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE id = proposal_id AND created_by = auth.uid()
    ) OR 
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  );

CREATE POLICY "System can manage proposal stats" ON public.proposal_stats
  FOR ALL USING (true);