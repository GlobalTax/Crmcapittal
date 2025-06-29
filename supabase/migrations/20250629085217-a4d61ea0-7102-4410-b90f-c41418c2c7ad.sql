
-- Create enum for email status
CREATE TYPE email_status AS ENUM ('SENT', 'OPENED', 'CLICKED');

-- Create tracked_emails table
CREATE TABLE public.tracked_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Unique identifier for the tracking pixel URL
  tracking_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  
  -- Email details
  recipient_email TEXT NOT NULL,
  subject TEXT,
  content TEXT,
  
  -- Relations to existing entities
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  target_company_id UUID REFERENCES public.target_companies(id) ON DELETE CASCADE,
  operation_id UUID REFERENCES public.operations(id) ON DELETE CASCADE,
  
  -- Tracking status
  status email_status NOT NULL DEFAULT 'SENT',
  opened_at TIMESTAMP WITH TIME ZONE,
  open_count INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  user_agent TEXT,
  ip_address INET,
  
  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tracked_emails ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own tracked emails" 
  ON public.tracked_emails 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can create tracked emails" 
  ON public.tracked_emails 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can update their own tracked emails" 
  ON public.tracked_emails 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Create indexes for performance
CREATE INDEX idx_tracked_emails_tracking_id ON public.tracked_emails(tracking_id);
CREATE INDEX idx_tracked_emails_lead_id ON public.tracked_emails(lead_id);
CREATE INDEX idx_tracked_emails_contact_id ON public.tracked_emails(contact_id);
CREATE INDEX idx_tracked_emails_target_company_id ON public.tracked_emails(target_company_id);
CREATE INDEX idx_tracked_emails_status ON public.tracked_emails(status);
CREATE INDEX idx_tracked_emails_sent_at ON public.tracked_emails(sent_at);

-- Create trigger for updated_at
CREATE TRIGGER update_tracked_emails_updated_at
  BEFORE UPDATE ON public.tracked_emails
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
