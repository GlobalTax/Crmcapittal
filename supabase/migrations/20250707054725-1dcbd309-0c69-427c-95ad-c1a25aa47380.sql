-- Create mandate_documents table for document management
CREATE TABLE public.mandate_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES buying_mandates(id) ON DELETE CASCADE,
  target_id UUID REFERENCES mandate_targets(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'general', -- nda, loi, info_sheet, presentation, other
  file_url TEXT NOT NULL,
  file_size BIGINT,
  content_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  is_confidential BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create mandate_client_access table for client portal access
CREATE TABLE public.mandate_client_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES buying_mandates(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL UNIQUE,
  client_email TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create mandate_comments table for client feedback
CREATE TABLE public.mandate_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES buying_mandates(id) ON DELETE CASCADE,
  target_id UUID REFERENCES mandate_targets(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  comment_type TEXT DEFAULT 'client_feedback', -- client_feedback, internal_note, status_update
  is_client_visible BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  client_access_id UUID REFERENCES mandate_client_access(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create storage bucket for mandate documents
INSERT INTO storage.buckets (id, name, public) VALUES ('mandate-documents', 'mandate-documents', false);

-- Enable RLS on new tables
ALTER TABLE public.mandate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandate_client_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandate_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mandate_documents
CREATE POLICY "Users can view documents for their mandates" 
ON public.mandate_documents FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.buying_mandates 
    WHERE id = mandate_documents.mandate_id 
    AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    ))
  )
);

CREATE POLICY "Users can create documents for their mandates" 
ON public.mandate_documents FOR INSERT 
WITH CHECK (
  auth.uid() = uploaded_by AND
  EXISTS (
    SELECT 1 FROM public.buying_mandates 
    WHERE id = mandate_documents.mandate_id 
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Users can update documents for their mandates" 
ON public.mandate_documents FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.buying_mandates 
    WHERE id = mandate_documents.mandate_id 
    AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    ))
  )
);

CREATE POLICY "Users can delete documents for their mandates" 
ON public.mandate_documents FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.buying_mandates 
    WHERE id = mandate_documents.mandate_id 
    AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    ))
  )
);

-- RLS Policies for mandate_client_access
CREATE POLICY "Users can manage client access for their mandates" 
ON public.mandate_client_access FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.buying_mandates 
    WHERE id = mandate_client_access.mandate_id 
    AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    ))
  )
);

-- RLS Policies for mandate_comments
CREATE POLICY "Users can view comments for their mandates" 
ON public.mandate_comments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.buying_mandates 
    WHERE id = mandate_comments.mandate_id 
    AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    ))
  )
);

CREATE POLICY "Users can create comments for their mandates" 
ON public.mandate_comments FOR INSERT 
WITH CHECK (
  (auth.uid() = created_by AND EXISTS (
    SELECT 1 FROM public.buying_mandates 
    WHERE id = mandate_comments.mandate_id 
    AND created_by = auth.uid()
  )) OR 
  (client_access_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.mandate_client_access 
    WHERE id = mandate_comments.client_access_id 
    AND is_active = true 
    AND expires_at > now()
  ))
);

CREATE POLICY "Users can update comments for their mandates" 
ON public.mandate_comments FOR UPDATE 
USING (
  auth.uid() = created_by AND EXISTS (
    SELECT 1 FROM public.buying_mandates 
    WHERE id = mandate_comments.mandate_id 
    AND created_by = auth.uid()
  )
);

-- Storage policies for mandate documents
CREATE POLICY "Users can view documents for their mandates" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'mandate-documents' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  ))
);

CREATE POLICY "Users can upload documents for their mandates" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'mandate-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their mandate documents" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'mandate-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their mandate documents" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'mandate-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add updated_at triggers
CREATE TRIGGER update_mandate_documents_updated_at
  BEFORE UPDATE ON public.mandate_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mandate_client_access_updated_at
  BEFORE UPDATE ON public.mandate_client_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mandate_comments_updated_at
  BEFORE UPDATE ON public.mandate_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();