-- Add onboarding_complete field to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN onboarding_complete boolean DEFAULT false;

-- Create user_onboarding_progress table for detailed tracking
CREATE TABLE public.user_onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_id text NOT NULL,
  step_name text NOT NULL,
  completed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  step_data jsonb DEFAULT '{}',
  UNIQUE(user_id, step_id)
);

-- Enable RLS on user_onboarding_progress
ALTER TABLE public.user_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_onboarding_progress
CREATE POLICY "Users can manage their own onboarding progress"
ON public.user_onboarding_progress
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_user_onboarding_progress_user_id ON public.user_onboarding_progress(user_id);
CREATE INDEX idx_user_onboarding_progress_step_id ON public.user_onboarding_progress(step_id);