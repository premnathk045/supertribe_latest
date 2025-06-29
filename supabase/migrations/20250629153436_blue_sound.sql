/*
  # Add Avatars Storage Bucket

  1. New Storage Bucket
    - Create an 'avatars' bucket for storing user profile images
    - Set proper security policies for access control

  2. Security
    - Enable row level security for the bucket
    - Create policies for authenticated users to:
      - Read any avatar (public access)
      - Upload their own avatars only
      - Delete their own avatars
*/

-- Create a new storage bucket for avatars
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('avatars', 'avatars', TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Enable row level security on the bucket
UPDATE storage.buckets
SET public = TRUE
WHERE id = 'avatars';

-- Create policy to allow users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to read any avatar
CREATE POLICY "Anyone can read avatars"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'avatars'
);

-- Create policy to allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);