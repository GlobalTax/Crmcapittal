-- Create table for transaction interested parties
CREATE TABLE public.transaction_interested_parties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL,
  contact_id UUID,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  interest_level TEXT NOT NULL DEFAULT 'initial' CHECK (interest_level IN ('initial', 'low', 'medium', 'high', 'very_high')),
  process_status TEXT NOT NULL DEFAULT 'initial' CHECK (process_status IN ('initial', 'teaser_sent', 'nda_signed', 'due_diligence', 'offer_submitted', 'negotiation', 'closed_won', 'closed_lost')),
  financial_capacity BIGINT,
  score INTEGER DEFAULT 0,
  notes TEXT,
  documents_shared TEXT[],
  last_interaction_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.transaction_interested_parties ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view transaction interested parties"
ON public.transaction_interested_parties
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.deals 
    WHERE deals.id = transaction_interested_parties.transaction_id 
    AND deals.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can create transaction interested parties"
ON public.transaction_interested_parties
FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.deals 
    WHERE deals.id = transaction_interested_parties.transaction_id 
    AND deals.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update transaction interested parties"
ON public.transaction_interested_parties
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.deals 
    WHERE deals.id = transaction_interested_parties.transaction_id 
    AND deals.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can delete transaction interested parties"
ON public.transaction_interested_parties
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.deals 
    WHERE deals.id = transaction_interested_parties.transaction_id 
    AND deals.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Create indexes for better performance
CREATE INDEX idx_transaction_interested_parties_transaction_id ON public.transaction_interested_parties(transaction_id);
CREATE INDEX idx_transaction_interested_parties_contact_id ON public.transaction_interested_parties(contact_id);
CREATE INDEX idx_transaction_interested_parties_process_status ON public.transaction_interested_parties(process_status);

-- Create trigger for updated_at
CREATE TRIGGER update_transaction_interested_parties_updated_at
  BEFORE UPDATE ON public.transaction_interested_parties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();