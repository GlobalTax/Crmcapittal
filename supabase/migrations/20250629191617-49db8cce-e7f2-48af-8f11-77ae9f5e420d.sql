
-- Create enum types for lead nurturing
CREATE TYPE lead_stage AS ENUM ('CAPTURED', 'QUALIFIED', 'NURTURING', 'SALES_READY', 'CONVERTED', 'LOST');
CREATE TYPE lead_source AS ENUM ('WEBSITE_FORM', 'CAPITAL_MARKET', 'REFERRAL', 'EMAIL_CAMPAIGN', 'SOCIAL_MEDIA', 'COLD_OUTREACH', 'EVENT', 'OTHER');
CREATE TYPE nurturing_status AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED');
CREATE TYPE activity_type AS ENUM ('EMAIL_SENT', 'EMAIL_OPENED', 'EMAIL_CLICKED', 'CALL_MADE', 'MEETING_SCHEDULED', 'FORM_SUBMITTED', 'WEBSITE_VISIT', 'DOCUMENT_DOWNLOADED');

-- Create lead_nurturing table for tracking lead progression and scoring
CREATE TABLE public.lead_nurturing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  stage lead_stage NOT NULL DEFAULT 'CAPTURED',
  lead_score INTEGER NOT NULL DEFAULT 0,
  engagement_score INTEGER NOT NULL DEFAULT 0,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  next_action_date TIMESTAMP WITH TIME ZONE,
  nurturing_status nurturing_status NOT NULL DEFAULT 'ACTIVE',
  assigned_to_id UUID REFERENCES auth.users(id),
  source_details JSONB DEFAULT '{}',
  qualification_criteria JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead_activities table for tracking detailed lead interactions
CREATE TABLE public.lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  activity_data JSONB DEFAULT '{}',
  points_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create nurturing_sequences table for automated lead nurturing workflows
CREATE TABLE public.nurturing_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_criteria JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nurturing_steps table for individual steps in sequences
CREATE TABLE public.nurturing_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL REFERENCES public.nurturing_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('EMAIL', 'TASK', 'DELAY', 'CONDITION')),
  delay_days INTEGER NOT NULL DEFAULT 0,
  email_template_id UUID,
  task_description TEXT,
  condition_criteria JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create lead_scoring_rules table for automated scoring configuration
CREATE TABLE public.lead_scoring_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_condition JSONB NOT NULL,
  points_awarded INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_lead_nurturing_lead_id ON public.lead_nurturing(lead_id);
CREATE INDEX idx_lead_nurturing_stage ON public.lead_nurturing(stage);
CREATE INDEX idx_lead_nurturing_score ON public.lead_nurturing(lead_score DESC);
CREATE INDEX idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX idx_lead_activities_type ON public.lead_activities(activity_type);
CREATE INDEX idx_lead_activities_created_at ON public.lead_activities(created_at DESC);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_lead_nurturing_updated_at
  BEFORE UPDATE ON public.lead_nurturing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nurturing_sequences_updated_at
  BEFORE UPDATE ON public.nurturing_sequences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update lead score
CREATE OR REPLACE FUNCTION public.update_lead_score(p_lead_id UUID, p_points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.lead_nurturing (lead_id, lead_score, updated_at)
  VALUES (p_lead_id, p_points_to_add, now())
  ON CONFLICT (lead_id) 
  DO UPDATE SET 
    lead_score = lead_nurturing.lead_score + p_points_to_add,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all tables
ALTER TABLE public.lead_nurturing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurturing_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurturing_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_scoring_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing access for authenticated users)
CREATE POLICY "Users can view lead nurturing data" ON public.lead_nurturing FOR SELECT USING (true);
CREATE POLICY "Users can insert lead nurturing data" ON public.lead_nurturing FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update lead nurturing data" ON public.lead_nurturing FOR UPDATE USING (true);

CREATE POLICY "Users can view lead activities" ON public.lead_activities FOR SELECT USING (true);
CREATE POLICY "Users can insert lead activities" ON public.lead_activities FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view nurturing sequences" ON public.nurturing_sequences FOR SELECT USING (true);
CREATE POLICY "Users can manage nurturing sequences" ON public.nurturing_sequences FOR ALL USING (true);

CREATE POLICY "Users can view nurturing steps" ON public.nurturing_steps FOR SELECT USING (true);
CREATE POLICY "Users can manage nurturing steps" ON public.nurturing_steps FOR ALL USING (true);

CREATE POLICY "Users can view scoring rules" ON public.lead_scoring_rules FOR SELECT USING (true);
CREATE POLICY "Users can manage scoring rules" ON public.lead_scoring_rules FOR ALL USING (true);
