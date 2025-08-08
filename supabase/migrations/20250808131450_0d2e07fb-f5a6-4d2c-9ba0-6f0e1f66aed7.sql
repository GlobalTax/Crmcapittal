-- Create feature_flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  organization_id UUID,
  environment TEXT,
  rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(key, organization_id, environment)
);

-- Create feature_analytics table
CREATE TABLE IF NOT EXISTS public.feature_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_key TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id UUID,
  organization_id UUID,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feature_flags (simplified without organization)
CREATE POLICY "Users can view feature flags"
ON public.feature_flags
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage feature flags"
ON public.feature_flags
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

-- RLS Policies for feature_analytics
CREATE POLICY "Users can view their own analytics"
ON public.feature_analytics
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own analytics"
ON public.feature_analytics
FOR INSERT
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can view all analytics"
ON public.feature_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

-- Create indexes for performance
CREATE INDEX idx_feature_flags_key_org_env ON public.feature_flags(key, organization_id, environment);
CREATE INDEX idx_feature_analytics_feature_timestamp ON public.feature_analytics(feature_key, timestamp);
CREATE INDEX idx_feature_analytics_user_timestamp ON public.feature_analytics(user_id, timestamp);

-- Insert default feature flag for lead_closure_dialog
INSERT INTO public.feature_flags (key, enabled, description, rollout_percentage) 
VALUES (
  'lead_closure_dialog', 
  true, 
  'Enable the lead closure dialog feature for converting leads to mandates/valuations',
  100
) ON CONFLICT (key, organization_id, environment) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_flags_updated_at();