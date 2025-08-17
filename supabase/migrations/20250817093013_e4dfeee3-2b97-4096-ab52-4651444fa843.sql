-- Enable RLS on pipelines and stages tables and add basic policies

-- Enable RLS on pipelines table
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

-- Enable RLS on stages table
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;

-- Enable RLS on stage_actions table
ALTER TABLE public.stage_actions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on pipeline_templates table
ALTER TABLE public.pipeline_templates ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for pipelines table
CREATE POLICY "Users can view active pipelines" ON public.pipelines
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage pipelines" ON public.pipelines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Add RLS policies for stages table
CREATE POLICY "Users can view active stages" ON public.stages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage stages" ON public.stages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Add RLS policies for stage_actions table
CREATE POLICY "Users can view active stage actions" ON public.stage_actions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage stage actions" ON public.stage_actions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Add RLS policies for pipeline_templates table
CREATE POLICY "Users can view public templates" ON public.pipeline_templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage their own templates" ON public.pipeline_templates
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all templates" ON public.pipeline_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );