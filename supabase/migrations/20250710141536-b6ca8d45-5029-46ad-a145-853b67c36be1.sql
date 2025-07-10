-- Create storage bucket for company files
INSERT INTO storage.buckets (id, name, public) VALUES ('company-files', 'company-files', false);

-- Create storage policies for company files
CREATE POLICY "Company files are viewable by file owner or company owner" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'company-files' AND 
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM company_files 
      JOIN companies ON companies.id = company_files.company_id
      WHERE company_files.file_url LIKE '%' || name || '%'
      AND companies.created_by = auth.uid()
    )
  )
);

CREATE POLICY "Users can upload their own company files" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'company-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own company files" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'company-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own company files" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'company-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);