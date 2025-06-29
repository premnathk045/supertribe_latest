/*
  # Message Media Storage

  1. New Features
    - Create a dedicated storage bucket for message media attachments
    - Set up appropriate security policies for the bucket

  2. Security
    - Users can upload their own message media files
    - Users can view media from conversations they participate in
    - Users can delete their own media files
*/

-- Create a new storage bucket for message media
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('message-media', 'message-media', FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Enable row level security on the bucket
UPDATE storage.buckets
SET public = FALSE
WHERE id = 'message-media';

-- Create policy to allow users to upload their own files
CREATE POLICY "Users can upload their own message media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'message-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to read message media from their conversations
CREATE POLICY "Users can read message media from their conversations"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-media' AND
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE cp.user_id = auth.uid()
      AND cp.is_active = true
      AND m.media_url LIKE '%' || storage.filename(name) || '%'
  )
);

-- Create policy to allow users to delete their own message media
CREATE POLICY "Users can delete their own message media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'message-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);