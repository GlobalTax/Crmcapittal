-- ROD Builder Modernization: Enhanced Database Schema (Fixed)

-- 1. ROD Templates system
CREATE TABLE public.rod_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL DEFAULT 'custom',
  template_data JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enhanced ROD versions for collaboration
CREATE TABLE public.rod_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rod_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  changes_summary TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. ROD Comments for collaboration
CREATE TABLE public.rod_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rod_id UUID NOT NULL,
  rod_version_id UUID REFERENCES rod_versions(id),
  parent_id UUID REFERENCES rod_comments(id),
  content TEXT NOT NULL,
  position_data JSONB,
  status TEXT DEFAULT 'open',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Enhanced subscriber segments
CREATE TABLE public.subscriber_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  segment_type TEXT NOT NULL DEFAULT 'manual',
  conditions JSONB NOT NULL DEFAULT '{}',
  subscriber_count INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE,
  is_dynamic BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Subscriber segment memberships
CREATE TABLE public.subscriber_segment_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES subscriber_segments(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  added_by UUID REFERENCES auth.users(id),
  UNIQUE(subscriber_id, segment_id)
);

-- 6. Enhanced campaign analytics
CREATE TABLE public.campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES subscribers(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Campaign A/B tests
CREATE TABLE public.campaign_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  test_name TEXT NOT NULL,
  variant_a JSONB NOT NULL,
  variant_b JSONB NOT NULL,
  split_percentage NUMERIC DEFAULT 50.0,
  winner_variant TEXT,
  confidence_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 8. ROD engagement tracking
CREATE TABLE public.rod_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rod_log_id UUID REFERENCES rod_log(id),
  subscriber_email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  section_id TEXT,
  click_position JSONB,
  engagement_score INTEGER DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. Subscriber behavior scoring
CREATE TABLE public.subscriber_behavior_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
  engagement_score INTEGER DEFAULT 0,
  recency_score INTEGER DEFAULT 0,
  frequency_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  behavior_data JSONB DEFAULT '{}',
  UNIQUE(subscriber_id)
);

-- 10. Campaign automation workflows
CREATE TABLE public.campaign_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}',
  campaign_template JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  execution_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add new columns to existing tables (split into separate statements)
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS behavior_score INTEGER DEFAULT 0;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS engagement_level TEXT DEFAULT 'unknown';
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS last_engagement_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS lifecycle_stage TEXT DEFAULT 'new';
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS acquisition_source TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS campaign_type TEXT DEFAULT 'newsletter';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS template_id UUID;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS targeting_config JSONB DEFAULT '{}';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS send_schedule JSONB DEFAULT '{}';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS ab_test_id UUID;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS automation_workflow_id UUID;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS performance_metrics JSONB DEFAULT '{}';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rod_templates_type ON rod_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_rod_templates_public ON rod_templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_rod_versions_rod_id ON rod_versions(rod_id);
CREATE INDEX IF NOT EXISTS idx_rod_comments_rod_id ON rod_comments(rod_id);
CREATE INDEX IF NOT EXISTS idx_subscriber_segments_type ON subscriber_segments(segment_type);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign ON campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_subscriber ON campaign_analytics(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_event ON campaign_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_rod_engagement_rod_log ON rod_engagement(rod_log_id);
CREATE INDEX IF NOT EXISTS idx_subscriber_behavior_scores_score ON subscriber_behavior_scores(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_subscribers_engagement_level ON subscribers(engagement_level);
CREATE INDEX IF NOT EXISTS idx_subscribers_behavior_score ON subscribers(behavior_score DESC);

-- Enable RLS
ALTER TABLE rod_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rod_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rod_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_segment_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rod_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_behavior_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_workflows ENABLE ROW LEVEL SECURITY;