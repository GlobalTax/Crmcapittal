-- Create table for storing Nylas email accounts and grants
CREATE TABLE public.nylas_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'imap',
  grant_id TEXT UNIQUE,
  access_token TEXT,
  connector_id TEXT,
  account_status TEXT NOT NULL DEFAULT 'pending',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, email_address)
);

-- Enable RLS
ALTER TABLE public.nylas_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own nylas accounts"
  ON public.nylas_accounts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_nylas_accounts_updated_at
  BEFORE UPDATE ON public.nylas_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update tracked_emails table to link with Nylas accounts
ALTER TABLE public.tracked_emails 
ADD COLUMN nylas_account_id UUID REFERENCES public.nylas_accounts(id),
ADD COLUMN nylas_message_id TEXT,
ADD COLUMN nylas_thread_id TEXT;