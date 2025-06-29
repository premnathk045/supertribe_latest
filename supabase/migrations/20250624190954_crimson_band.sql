/*
  # Add Message Media Storage Bucket

  1. New Storage Bucket
    - Create a 'message-media' bucket for storing images shared in messages
    - Set proper security policies for access control

  2. Security
    - Enable row level security for the bucket
    - Create policies for authenticated users to:
      - Read media from conversations they participate in
      - Upload media to the bucket (own files only)
      - Delete their own uploaded media
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