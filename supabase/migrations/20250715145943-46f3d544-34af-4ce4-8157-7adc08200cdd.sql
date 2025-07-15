-- Add missing columns to opportunities table
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS highlighted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS rod_order integer,
ADD COLUMN IF NOT EXISTS notes text;

-- Create subscribers table
CREATE TABLE IF NOT EXISTS public.subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  segment text NOT NULL DEFAULT 'general',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  verified boolean NOT NULL DEFAULT false,
  unsubscribed boolean NOT NULL DEFAULT false
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_ids uuid[] NOT NULL DEFAULT '{}',
  audience text NOT NULL DEFAULT 'general',
  subject text NOT NULL,
  html_body text NOT NULL,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create rod_log table
CREATE TABLE IF NOT EXISTS public.rod_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deals jsonb NOT NULL DEFAULT '[]',
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on new tables
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rod_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscribers
CREATE POLICY "Admin users can manage subscribers" ON public.subscribers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Create RLS policies for campaigns
CREATE POLICY "Admin users can manage campaigns" ON public.campaigns
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Create RLS policies for rod_log
CREATE POLICY "Admin users can manage rod_log" ON public.rod_log
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscribers_segment ON public.subscribers(segment);
CREATE INDEX IF NOT EXISTS idx_subscribers_unsubscribed ON public.subscribers(unsubscribed);
CREATE INDEX IF NOT EXISTS idx_campaigns_sent_at ON public.campaigns(sent_at);
CREATE INDEX IF NOT EXISTS idx_rod_log_sent_at ON public.rod_log(sent_at);
CREATE INDEX IF NOT EXISTS idx_opportunities_highlighted ON public.opportunities(highlighted);
CREATE INDEX IF NOT EXISTS idx_opportunities_rod_order ON public.opportunities(rod_order);