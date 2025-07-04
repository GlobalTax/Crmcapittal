-- Create tables for advanced contact management (HubSpot-like features)

-- Table for saved contact views per user
CREATE TABLE public.contact_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  columns JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_by TEXT,
  sort_order TEXT DEFAULT 'asc',
  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for contact_views
ALTER TABLE public.contact_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for contact_views
CREATE POLICY "Users can view their own contact views"
ON public.contact_views FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contact views"
ON public.contact_views FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact views"
ON public.contact_views FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contact views"
ON public.contact_views FOR DELETE
USING (auth.uid() = user_id);

-- Table for contact activities/timeline
CREATE TABLE public.contact_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_data JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for contact_activities
ALTER TABLE public.contact_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for contact_activities
CREATE POLICY "Users can view contact activities"
ON public.contact_activities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = contact_activities.contact_id 
    AND contacts.created_by = auth.uid()
  )
);

CREATE POLICY "Users can create contact activities"
ON public.contact_activities FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = contact_activities.contact_id 
    AND contacts.created_by = auth.uid()
  )
);

-- Table for user column preferences
CREATE TABLE public.user_table_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  column_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, table_name)
);

-- Enable RLS for user_table_preferences
ALTER TABLE public.user_table_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_table_preferences
CREATE POLICY "Users can manage their own table preferences"
ON public.user_table_preferences FOR ALL
USING (auth.uid() = user_id);

-- Foreign key relationships
ALTER TABLE public.contact_views 
ADD CONSTRAINT contact_views_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.contact_activities 
ADD CONSTRAINT contact_activities_contact_id_fkey 
FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;

ALTER TABLE public.contact_activities 
ADD CONSTRAINT contact_activities_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.user_table_preferences 
ADD CONSTRAINT user_table_preferences_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Indexes for better performance
CREATE INDEX idx_contact_views_user_id ON public.contact_views(user_id);
CREATE INDEX idx_contact_activities_contact_id ON public.contact_activities(contact_id);
CREATE INDEX idx_contact_activities_created_at ON public.contact_activities(created_at DESC);
CREATE INDEX idx_user_table_preferences_user_table ON public.user_table_preferences(user_id, table_name);

-- Trigger for updated_at
CREATE TRIGGER update_contact_views_updated_at
  BEFORE UPDATE ON public.contact_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_activities_updated_at
  BEFORE UPDATE ON public.contact_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_table_preferences_updated_at
  BEFORE UPDATE ON public.user_table_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();