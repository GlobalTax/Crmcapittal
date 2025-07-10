-- Create RLS policies for company files storage (skip bucket creation since it exists)
CREATE POLICY "Users can upload company files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'company-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view company files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'company-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update company files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'company-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete company files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'company-files' AND auth.uid() IS NOT NULL);