-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'story-media', 
  'story-media', 
  true, 
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'story-thumbnails', 
  'story-thumbnails', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload their own story media" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all story media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own story media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own story media" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own story thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all story thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own story thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own story thumbnails" ON storage.objects;

-- Storage policies for story-media bucket
CREATE POLICY "Users can upload their own story media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'story-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view story media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'story-media');

CREATE POLICY "Users can update their own story media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'story-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own story media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'story-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for story-thumbnails bucket
CREATE POLICY "Users can upload their own story thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'story-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view story thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'story-thumbnails');

CREATE POLICY "Users can update their own story thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'story-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own story thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'story-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Function to cleanup expired story media
CREATE OR REPLACE FUNCTION cleanup_expired_story_media()
RETURNS void AS $$
DECLARE
  expired_story RECORD;
BEGIN
  -- Get expired stories with media
  FOR expired_story IN 
    SELECT id, media_path, thumbnail_url
    FROM stories 
    WHERE expires_at < NOW() 
    AND is_active = true 
    AND (media_path IS NOT NULL OR thumbnail_url IS NOT NULL)
  LOOP
    -- Delete media file from storage
    IF expired_story.media_path IS NOT NULL THEN
      PERFORM storage.delete_object('story-media', expired_story.media_path);
    END IF;
    
    -- Delete thumbnail file from storage
    IF expired_story.thumbnail_url IS NOT NULL THEN
      -- Extract path from URL for thumbnail deletion
      DECLARE
        thumbnail_path TEXT;
      BEGIN
        thumbnail_path := regexp_replace(expired_story.thumbnail_url, '^.*/story-thumbnails/', '');
        IF thumbnail_path != expired_story.thumbnail_url THEN
          PERFORM storage.delete_object('story-thumbnails', thumbnail_path);
        END IF;
      END;
    END IF;
    
    -- Mark story as inactive
    UPDATE stories 
    SET is_active = false, 
        updated_at = NOW()
    WHERE id = expired_story.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run cleanup (this would typically be done via pg_cron or external scheduler)
-- For now, we'll create the function and it can be called manually or via a scheduled task

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;