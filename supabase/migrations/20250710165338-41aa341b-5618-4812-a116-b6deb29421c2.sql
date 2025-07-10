-- Make the company-files bucket public to resolve 400 errors
UPDATE storage.buckets 
SET public = true 
WHERE id = 'company-files';

-- Drop ALL existing policies for company-files bucket
DROP POLICY IF EXISTS "Users can upload company files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view company files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update company files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete company files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own company files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own company files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view company files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload company files" ON storage.objects;

-- Create new simplified policies for company files (public bucket)
CREATE POLICY "Public access to company files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'company-files');

CREATE POLICY "Authenticated users can manage company files" 
ON storage.objects 
FOR ALL
USING (bucket_id = 'company-files' AND auth.uid() IS NOT NULL)
WITH CHECK (bucket_id = 'company-files' AND auth.uid() IS NOT NULL);