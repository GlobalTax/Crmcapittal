-- Create lead assignment rules table
CREATE TABLE public.lead_assignment_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  conditions JSONB NOT NULL DEFAULT '{}',
  assignment_type TEXT NOT NULL DEFAULT 'user', -- 'user', 'round_robin', 'load_balance'
  assigned_user_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead analytics table for advanced metrics
CREATE TABLE public.lead_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'conversion_rate', 'engagement_score', 'time_to_close', etc.
  metric_value NUMERIC NOT NULL,
  calculation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead segmentation table
CREATE TABLE public.lead_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}',
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for lead-segment relationships
CREATE TABLE public.lead_segment_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES public.lead_segments(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lead_id, segment_id)
);

-- Create lead workflow templates
CREATE TABLE public.lead_workflow_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  workflow_steps JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead workflow executions
CREATE TABLE public.lead_workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.lead_workflow_templates(id),
  current_step INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'failed', 'paused'
  execution_data JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_lead_assignment_rules_active ON public.lead_assignment_rules(is_active, priority);
CREATE INDEX idx_lead_analytics_lead_id ON public.lead_analytics(lead_id);
CREATE INDEX idx_lead_analytics_type_date ON public.lead_analytics(metric_type, calculation_date DESC);
CREATE INDEX idx_lead_segments_active ON public.lead_segments(is_active);
CREATE INDEX idx_lead_segment_assignments_lead ON public.lead_segment_assignments(lead_id);
CREATE INDEX idx_lead_segment_assignments_segment ON public.lead_segment_assignments(segment_id);
CREATE INDEX idx_workflow_templates_active ON public.lead_workflow_templates(is_active);
CREATE INDEX idx_workflow_executions_lead ON public.lead_workflow_executions(lead_id);
CREATE INDEX idx_workflow_executions_status ON public.lead_workflow_executions(status);

-- Enable RLS
ALTER TABLE public.lead_assignment_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_segment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_workflow_executions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin users can manage assignment rules" ON public.lead_assignment_rules FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Users can view lead analytics" ON public.lead_analytics FOR SELECT USING (true);
CREATE POLICY "Users can insert lead analytics" ON public.lead_analytics FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage their segments" ON public.lead_segments FOR ALL 
USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Users can view segment assignments" ON public.lead_segment_assignments FOR SELECT USING (true);
CREATE POLICY "Users can manage segment assignments" ON public.lead_segment_assignments FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage workflow templates" ON public.lead_workflow_templates FOR ALL 
USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Users can view workflow executions" ON public.lead_workflow_executions FOR SELECT USING (true);
CREATE POLICY "Users can manage workflow executions" ON public.lead_workflow_executions FOR ALL USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_lead_assignment_rules_updated_at
  BEFORE UPDATE ON public.lead_assignment_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_segments_updated_at
  BEFORE UPDATE ON public.lead_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at
  BEFORE UPDATE ON public.lead_workflow_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_executions_updated_at
  BEFORE UPDATE ON public.lead_workflow_executions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default scoring rules
INSERT INTO public.lead_scoring_rules (name, description, trigger_condition, points_awarded) VALUES
('Form Submission', 'Points for initial form submission', '{"activity_type": "FORM_SUBMITTED", "criteria": {}}', 10),
('Email Open', 'Points for opening marketing emails', '{"activity_type": "EMAIL_OPENED", "criteria": {}}', 2),
('Email Click', 'Points for clicking email links', '{"activity_type": "EMAIL_CLICKED", "criteria": {}}', 5),
('Website Visit', 'Points for visiting website pages', '{"activity_type": "WEBSITE_VISIT", "criteria": {}}', 3),
('Document Download', 'Points for downloading resources', '{"activity_type": "DOCUMENT_DOWNLOADED", "criteria": {}}', 8),
('Meeting Scheduled', 'High value activity - meeting scheduled', '{"activity_type": "MEETING_SCHEDULED", "criteria": {}}', 25),
('Call Made', 'Points for successful phone calls', '{"activity_type": "CALL_MADE", "criteria": {}}', 15);

-- Insert default assignment rules
INSERT INTO public.lead_assignment_rules (name, description, priority, conditions, assignment_type) VALUES
('High Score Leads', 'Assign high-scoring leads to senior reps', 1, '{"lead_score_min": 50, "source": ["REFERRAL", "WEBSITE_FORM"]}', 'user'),
('New Leads Default', 'Default assignment for new leads', 999, '{}', 'round_robin');

-- Insert default segments
INSERT INTO public.lead_segments (name, description, criteria, color) VALUES
('High Value Prospects', 'Leads with high engagement and score', '{"lead_score_min": 40, "engagement_score_min": 30}', '#10B981'),
('Cold Leads', 'Leads with low engagement', '{"lead_score_max": 15, "last_activity_days_ago": 30}', '#EF4444'),
('Marketing Qualified', 'Leads from marketing campaigns', '{"source": ["EMAIL_CAMPAIGN", "SOCIAL_MEDIA"], "lead_score_min": 20}', '#8B5CF6'),
('Sales Ready', 'Leads ready for sales contact', '{"lead_score_min": 50, "stage": ["QUALIFIED", "SALES_READY"]}', '#F59E0B');

-- Create enhanced lead scoring function
CREATE OR REPLACE FUNCTION public.calculate_lead_engagement_score(p_lead_id UUID)
RETURNS INTEGER AS $$
DECLARE
  engagement_score INTEGER := 0;
  activity_count INTEGER;
  recent_activity_count INTEGER;
  last_activity_days INTEGER;
BEGIN
  -- Count total activities
  SELECT COUNT(*) INTO activity_count
  FROM lead_activities 
  WHERE lead_id = p_lead_id;
  
  -- Count recent activities (last 30 days)
  SELECT COUNT(*) INTO recent_activity_count
  FROM lead_activities 
  WHERE lead_id = p_lead_id 
  AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Calculate days since last activity
  SELECT EXTRACT(DAY FROM NOW() - MAX(created_at)) INTO last_activity_days
  FROM lead_activities 
  WHERE lead_id = p_lead_id;
  
  -- Calculate engagement score
  engagement_score := engagement_score + (activity_count * 2);
  engagement_score := engagement_score + (recent_activity_count * 5);
  
  -- Penalty for inactive leads
  IF last_activity_days > 30 THEN
    engagement_score := engagement_score - (last_activity_days - 30);
  END IF;
  
  -- Ensure minimum score of 0
  engagement_score := GREATEST(engagement_score, 0);
  
  RETURN engagement_score;
END;
$$ LANGUAGE plpgsql;

-- Create lead assignment function
CREATE OR REPLACE FUNCTION public.auto_assign_lead(p_lead_id UUID)
RETURNS UUID AS $$
DECLARE
  assigned_user_id UUID;
  rule_record RECORD;
  lead_record RECORD;
BEGIN
  -- Get lead data
  SELECT * INTO lead_record FROM leads WHERE id = p_lead_id;
  
  -- Loop through assignment rules by priority
  FOR rule_record IN 
    SELECT * FROM lead_assignment_rules 
    WHERE is_active = true 
    ORDER BY priority ASC
  LOOP
    -- Check if lead matches rule conditions
    -- This is simplified - in production, you'd want more sophisticated condition matching
    IF rule_record.conditions::text = '{}' OR 
       (rule_record.conditions->>'lead_score_min' IS NULL OR 
        COALESCE(lead_record.score, 0) >= (rule_record.conditions->>'lead_score_min')::INTEGER) THEN
      
      IF rule_record.assignment_type = 'user' AND rule_record.assigned_user_id IS NOT NULL THEN
        assigned_user_id := rule_record.assigned_user_id;
        EXIT;
      ELSIF rule_record.assignment_type = 'round_robin' THEN
        -- Simple round-robin: get next available user with admin role
        SELECT user_id INTO assigned_user_id
        FROM user_roles 
        WHERE role IN ('admin', 'superadmin')
        ORDER BY user_id
        LIMIT 1;
        EXIT;
      END IF;
    END IF;
  END LOOP;
  
  -- Update lead with assignment
  IF assigned_user_id IS NOT NULL THEN
    UPDATE leads 
    SET assigned_to_id = assigned_user_id, updated_at = NOW()
    WHERE id = p_lead_id;
  END IF;
  
  RETURN assigned_user_id;
END;
$$ LANGUAGE plpgsql;