-- Clean up ALL existing policies for company-files bucket
DROP POLICY IF EXISTS "Users can upload company files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view company files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update company files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete company files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own company files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own company files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view company files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload company files" ON storage.objects;
DROP POLICY IF EXISTS "Public access to company files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage company files" ON storage.objects;

-- Create simple, consistent policies for company-files bucket
CREATE POLICY "Company files are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'company-files');

CREATE POLICY "Authenticated users can upload to company files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'company-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update company files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'company-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete company files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'company-files' AND auth.uid() IS NOT NULL);

-- Fix existing file URLs that might be malformed
UPDATE company_files 
SET file_url = CASE 
  WHEN file_url LIKE '%/storage/v1/object/company-files/%' AND file_url NOT LIKE '%/storage/v1/object/public/company-files/%'
  THEN REPLACE(file_url, '/storage/v1/object/company-files/', '/storage/v1/object/public/company-files/')
  ELSE file_url
END
WHERE bucket_id = 'company-files' OR file_url LIKE '%company-files%';