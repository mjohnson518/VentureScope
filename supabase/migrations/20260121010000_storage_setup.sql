-- Storage bucket for documents
-- Run this in Supabase SQL Editor after creating the schema

-- Create the documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
    'application/msword',
    'text/csv',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket

-- Allow authenticated users to upload files to their org's folder
CREATE POLICY "Users can upload documents to their org folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.org_memberships om
    WHERE om.user_id = auth.uid()
    AND om.org_id::text = (storage.foldername(name))[1]
  )
);

-- Allow users to view documents in their org's folder
CREATE POLICY "Users can view documents in their org folder"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.org_memberships om
    WHERE om.user_id = auth.uid()
    AND om.org_id::text = (storage.foldername(name))[1]
  )
);

-- Allow users to update documents in their org's folder
CREATE POLICY "Users can update documents in their org folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.org_memberships om
    WHERE om.user_id = auth.uid()
    AND om.org_id::text = (storage.foldername(name))[1]
  )
);

-- Allow org admins to delete documents
CREATE POLICY "Org admins can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.org_memberships om
    WHERE om.user_id = auth.uid()
    AND om.org_id::text = (storage.foldername(name))[1]
    AND om.role IN ('owner', 'admin')
  )
);
