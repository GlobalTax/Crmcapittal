-- Create deal_documents table for document management
CREATE TABLE public.deal_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  content_type TEXT,
  document_category TEXT NOT NULL DEFAULT 'other',
  document_status TEXT NOT NULL DEFAULT 'draft',
  order_position INTEGER DEFAULT 0,
  notes TEXT,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deal_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for deal documents
CREATE POLICY "Users can view deal documents if they can view the deal" 
ON public.deal_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.deals 
    WHERE deals.id = deal_documents.deal_id 
    AND deals.is_active = true
  )
);

CREATE POLICY "Users can create deal documents for their deals" 
ON public.deal_documents 
FOR INSERT 
WITH CHECK (
  auth.uid() = uploaded_by 
  AND EXISTS (
    SELECT 1 FROM public.deals 
    WHERE deals.id = deal_documents.deal_id 
    AND deals.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update their own deal documents" 
ON public.deal_documents 
FOR UPDATE 
USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own deal documents" 
ON public.deal_documents 
FOR DELETE 
USING (auth.uid() = uploaded_by);

-- Create storage bucket for deal documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('deal-documents', 'deal-documents', false);

-- Create storage policies for deal documents
CREATE POLICY "Users can view deal documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'deal-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload deal documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'deal-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own deal documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'deal-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own deal documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'deal-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create trigger for automatic updated_at
CREATE TRIGGER update_deal_documents_updated_at
BEFORE UPDATE ON public.deal_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();