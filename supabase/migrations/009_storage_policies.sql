-- Phase 4: Storage bucket policies for task attachments
-- Note: The bucket 'task-attachments' should be created via Supabase dashboard or CLI

-- Insert bucket if it doesn't exist (this is a no-op if bucket exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-attachments', 'task-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload task attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'task-attachments');

-- Policy: Allow authenticated users to read files
CREATE POLICY "Authenticated users can read task attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'task-attachments');

-- Policy: Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update task attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'task-attachments');

-- Policy: Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete task attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'task-attachments');
