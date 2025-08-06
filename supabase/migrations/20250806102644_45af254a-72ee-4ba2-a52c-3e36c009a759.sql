-- Create calendar_events table
CREATE TABLE public.calendar_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    attendees JSONB DEFAULT '[]'::jsonb,
    event_type TEXT NOT NULL DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'call', 'task', 'appointment')),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own events" 
ON public.calendar_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events" 
ON public.calendar_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" 
ON public.calendar_events 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" 
ON public.calendar_events 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_date ON public.calendar_events(start_date);
CREATE INDEX idx_calendar_events_date_range ON public.calendar_events(start_date, end_date);