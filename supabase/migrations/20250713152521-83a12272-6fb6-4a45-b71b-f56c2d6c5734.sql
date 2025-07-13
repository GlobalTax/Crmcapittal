-- Create storage bucket for lead files
INSERT INTO storage.buckets (id, name, public)
VALUES ('lead-files', 'lead-files', true);

-- Create storage policies for lead files
CREATE POLICY "Users can view lead files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'lead-files' AND
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id::text = (storage.foldername(name))[1]
      AND leads.assigned_to_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload lead files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lead-files' AND
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id::text = (storage.foldername(name))[1]
      AND leads.assigned_to_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their uploaded lead files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'lead-files' AND
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id::text = (storage.foldername(name))[1]
      AND leads.assigned_to_id = auth.uid()
    )
  );