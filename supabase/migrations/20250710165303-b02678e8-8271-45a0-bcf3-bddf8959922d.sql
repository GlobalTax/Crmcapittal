-- Make the company-files bucket public to resolve 400 errors
UPDATE storage.buckets 
SET public = true 
WHERE id = 'company-files';

-- Drop the overly restrictive policies and create better ones
DROP POLICY IF EXISTS "Users can upload company files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view company files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update company files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete company files" ON storage.objects;

-- Create more specific policies for company files
CREATE POLICY "Anyone can view company files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'company-files');

CREATE POLICY "Authenticated users can upload company files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'company-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own company files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'company-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own company files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'company-files' AND auth.uid()::text = (storage.foldername(name))[1]);