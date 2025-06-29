/*
  # Stories System Database Schema

  1. New Tables
    - `stories` - Main stories table with metadata
    - `story_views` - Track story views by users
    - `story_interactions` - Track likes, shares, reactions

  2. Storage
    - Create storage buckets for media files
    - Set up proper access policies

  3. Security
    - Enable RLS on all tables
    - Add policies for story access and creation
*/

-- Create stories table (enhanced version)
DROP TABLE IF EXISTS stories CASCADE;
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('photo', 'video', 'text')),
  media_url TEXT,
  media_path TEXT, -- Storage path for cleanup
  caption TEXT,
  text_content TEXT,
  text_style JSONB DEFAULT '{}', -- Store text styling options
  background_style JSONB DEFAULT '{}', -- Store background options
  file_size BIGINT, -- File size in bytes
  file_type TEXT, -- MIME type
  duration INTEGER, -- Video duration in seconds
  thumbnail_url TEXT, -- Video thumbnail
  is_active BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create story_views table
CREATE TABLE story_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- Create story_interactions table
CREATE TABLE story_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'share', 'reaction')),
  reaction_emoji TEXT, -- For emoji reactions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_id, interaction_type)
);

-- Create indexes for performance
CREATE INDEX idx_stories_creator_id ON stories(creator_id);
CREATE INDEX idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX idx_stories_expires_at ON stories(expires_at);
CREATE INDEX idx_stories_active ON stories(is_active) WHERE is_active = true;
CREATE INDEX idx_story_views_story_id ON story_views(story_id);
CREATE INDEX idx_story_views_viewer_id ON story_views(viewer_id);
CREATE INDEX idx_story_interactions_story_id ON story_interactions(story_id);

-- Function to update story view count
CREATE OR REPLACE FUNCTION update_story_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stories 
  SET view_count = view_count + 1,
      updated_at = NOW()
  WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update story interaction counts
CREATE OR REPLACE FUNCTION update_story_interaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.interaction_type = 'like' THEN
      UPDATE stories 
      SET like_count = like_count + 1,
          updated_at = NOW()
      WHERE id = NEW.story_id;
    ELSIF NEW.interaction_type = 'share' THEN
      UPDATE stories 
      SET share_count = share_count + 1,
          updated_at = NOW()
      WHERE id = NEW.story_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.interaction_type = 'like' THEN
      UPDATE stories 
      SET like_count = GREATEST(like_count - 1, 0),
          updated_at = NOW()
      WHERE id = OLD.story_id;
    ELSIF OLD.interaction_type = 'share' THEN
      UPDATE stories 
      SET share_count = GREATEST(share_count - 1, 0),
          updated_at = NOW()
      WHERE id = OLD.story_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired stories
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void AS $$
BEGIN
  UPDATE stories 
  SET is_active = false,
      updated_at = NOW()
  WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_story_view_count
  AFTER INSERT ON story_views
  FOR EACH ROW
  EXECUTE FUNCTION update_story_view_count();

CREATE TRIGGER trigger_update_story_interaction_count
  AFTER INSERT OR DELETE ON story_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_story_interaction_count();

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_interactions ENABLE ROW LEVEL SECURITY;

-- Stories policies
CREATE POLICY "Everyone can read active stories"
  ON stories
  FOR SELECT
  USING (is_active = true AND expires_at > NOW());

CREATE POLICY "Verified creators can create stories"
  ON stories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = creator_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'creator'
      AND profiles.is_verified = true
    )
  );

CREATE POLICY "Creators can update own stories"
  ON stories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own stories"
  ON stories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Story views policies
CREATE POLICY "Users can read story views"
  ON story_views
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create story views"
  ON story_views
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = viewer_id);

-- Story interactions policies
CREATE POLICY "Users can read story interactions"
  ON story_interactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create story interactions"
  ON story_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own story interactions"
  ON story_interactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage buckets (these need to be run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('story-media', 'story-media', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('story-thumbnails', 'story-thumbnails', true);