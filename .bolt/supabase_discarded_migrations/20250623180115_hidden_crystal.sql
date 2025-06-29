/*
  # Complete Database Schema Migration
  
  This migration creates the complete database schema based on the SQL Definition.md file.
  
  1. Tables Created:
    - categories: Content categories for discovery
    - hashtags: Hashtag tracking and trending
    - profiles: User profiles extending auth.users
    - creator_verifications: Creator verification process
    - payment_methods: User payment methods
    - posts: User posts and content
    - profile_categories: Many-to-many relationship between profiles and categories
    - poll_votes: Votes on post polls
    - post_comments: Comments on posts
    - post_likes: Likes on posts
    - post_saves: Saved posts by users
    - post_views: Post view tracking
    - stories: User stories
    - story_interactions: Story likes, shares, reactions
    - story_views: Story view tracking
    
  2. Functions and Triggers:
    - Timestamp update triggers
    - Count update triggers for posts
    - Hashtag usage tracking
    - Story interaction counts
    
  3. Security:
    - Row Level Security enabled on all tables
    - Appropriate policies for data access
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create utility function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function for updating post comment count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function for updating post like count
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function for updating post view count
CREATE OR REPLACE FUNCTION update_post_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET view_count = view_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function for updating story interaction count
CREATE OR REPLACE FUNCTION update_story_interaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.interaction_type = 'like' THEN
      UPDATE stories SET like_count = like_count + 1 WHERE id = NEW.story_id;
    ELSIF NEW.interaction_type = 'share' THEN
      UPDATE stories SET share_count = share_count + 1 WHERE id = NEW.story_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.interaction_type = 'like' THEN
      UPDATE stories SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.story_id;
    ELSIF OLD.interaction_type = 'share' THEN
      UPDATE stories SET share_count = GREATEST(share_count - 1, 0) WHERE id = OLD.story_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function for updating story view count
CREATE OR REPLACE FUNCTION update_story_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stories SET view_count = view_count + 1 WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function for hashtag usage tracking
CREATE OR REPLACE FUNCTION trigger_update_hashtag_usage()
RETURNS TRIGGER AS $$
DECLARE
  tag_item text;
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.tags IS NOT NULL THEN
      FOREACH tag_item IN ARRAY NEW.tags
      LOOP
        INSERT INTO hashtags (tag, usage_count, last_used_at)
        VALUES (LOWER(tag_item), 1, NOW())
        ON CONFLICT (tag) 
        DO UPDATE SET 
          usage_count = hashtags.usage_count + 1,
          last_used_at = NOW(),
          updated_at = NOW();
      END LOOP;
    END IF;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NULL,
  icon text NOT NULL DEFAULT '📁'::text,
  slug text NOT NULL,
  is_active boolean NULL DEFAULT true,
  sort_order integer NULL DEFAULT 0,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_name_key UNIQUE (name),
  CONSTRAINT categories_slug_key UNIQUE (slug)
) TABLESPACE pg_default;

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories USING btree (is_active, sort_order) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories USING btree (slug) TABLESPACE pg_default;

-- Hashtags table
CREATE TABLE IF NOT EXISTS public.hashtags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tag text NOT NULL,
  usage_count integer NULL DEFAULT 0,
  trending_score numeric NULL DEFAULT 0,
  last_used_at timestamp with time zone NULL DEFAULT now(),
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT hashtags_pkey PRIMARY KEY (id),
  CONSTRAINT hashtags_tag_key UNIQUE (tag)
) TABLESPACE pg_default;

-- Hashtags indexes
CREATE INDEX IF NOT EXISTS idx_hashtags_trending ON public.hashtags USING btree (trending_score DESC, usage_count DESC) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_hashtags_tag ON public.hashtags USING btree (tag) TABLESPACE pg_default;

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  username text NULL,
  display_name text NULL,
  bio text NULL,
  avatar_url text NULL,
  user_type text NULL DEFAULT 'fan'::text,
  is_verified boolean NULL DEFAULT false,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_username_key UNIQUE (username),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id),
  CONSTRAINT profiles_user_type_check CHECK ((user_type = ANY (ARRAY['fan'::text, 'creator'::text])))
) TABLESPACE pg_default;

-- Creator verifications table
CREATE TABLE IF NOT EXISTS public.creator_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  status text NULL DEFAULT 'pending'::text,
  full_name text NULL,
  email text NULL,
  phone_number text NULL,
  country text NULL,
  city text NULL,
  age_verified boolean NULL DEFAULT false,
  age_verification_date timestamp with time zone NULL,
  profile_completed boolean NULL DEFAULT false,
  profile_completion_date timestamp with time zone NULL,
  payment_setup_completed boolean NULL DEFAULT false,
  payment_setup_date timestamp with time zone NULL,
  submitted_at timestamp with time zone NULL,
  approved_at timestamp with time zone NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT creator_verifications_pkey PRIMARY KEY (id),
  CONSTRAINT creator_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
  CONSTRAINT creator_verifications_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
) TABLESPACE pg_default;

-- Payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  type text NULL DEFAULT 'demo_card'::text,
  card_last_four text NULL,
  card_brand text NULL,
  is_default boolean NULL DEFAULT false,
  is_demo boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT payment_methods_pkey PRIMARY KEY (id),
  CONSTRAINT payment_methods_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
) TABLESPACE pg_default;

-- Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  content text NULL,
  media_urls text[] NULL,
  is_premium boolean NULL DEFAULT false,
  price numeric(10, 2) NULL,
  subscriber_discount integer NULL DEFAULT 0,
  tags text[] NULL,
  poll jsonb NULL DEFAULT '{}'::jsonb,
  preview_video_url text NULL,
  scheduled_for timestamp with time zone NULL,
  status text NULL DEFAULT 'published'::text,
  like_count integer NULL DEFAULT 0,
  comment_count integer NULL DEFAULT 0,
  share_count integer NULL DEFAULT 0,
  view_count integer NULL DEFAULT 0,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT posts_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES profiles (id),
  CONSTRAINT posts_status_check CHECK ((status = ANY (ARRAY['published'::text, 'scheduled'::text, 'draft'::text])))
) TABLESPACE pg_default;

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts USING btree (created_at DESC) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_for ON public.posts USING btree (scheduled_for) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_posts_tags ON public.posts USING gin (tags) TABLESPACE pg_default;

-- Profile categories junction table
CREATE TABLE IF NOT EXISTS public.profile_categories (
  profile_id uuid NOT NULL,
  category_id uuid NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT profile_categories_pkey PRIMARY KEY (profile_id, category_id),
  CONSTRAINT profile_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
  CONSTRAINT profile_categories_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Profile categories indexes
CREATE INDEX IF NOT EXISTS idx_profile_categories_profile ON public.profile_categories USING btree (profile_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_profile_categories_category ON public.profile_categories USING btree (category_id) TABLESPACE pg_default;

-- Poll votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NULL,
  user_id uuid NULL,
  option_index integer NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT poll_votes_pkey PRIMARY KEY (id),
  CONSTRAINT poll_votes_post_id_user_id_key UNIQUE (post_id, user_id),
  CONSTRAINT poll_votes_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
  CONSTRAINT poll_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Poll votes indexes
CREATE INDEX IF NOT EXISTS idx_poll_votes_post_id ON public.poll_votes USING btree (post_id) TABLESPACE pg_default;

-- Post comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NULL,
  user_id uuid NULL,
  content text NOT NULL,
  parent_id uuid NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT post_comments_pkey PRIMARY KEY (id),
  CONSTRAINT post_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES post_comments (id) ON DELETE CASCADE,
  CONSTRAINT post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
  CONSTRAINT post_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT post_comments_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES profiles (id)
) TABLESPACE pg_default;

-- Post comments indexes
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments USING btree (post_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON public.post_comments USING btree (parent_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON public.post_comments USING btree (created_at DESC) TABLESPACE pg_default;

-- Post likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NULL,
  user_id uuid NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT post_likes_post_id_user_id_key UNIQUE (post_id, user_id),
  CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
  CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Post likes indexes
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes USING btree (post_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes USING btree (user_id) TABLESPACE pg_default;

-- Post saves table
CREATE TABLE IF NOT EXISTS public.post_saves (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NULL,
  user_id uuid NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT post_saves_pkey PRIMARY KEY (id),
  CONSTRAINT post_saves_post_id_user_id_key UNIQUE (post_id, user_id),
  CONSTRAINT post_saves_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
  CONSTRAINT post_saves_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Post views table
CREATE TABLE IF NOT EXISTS public.post_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NULL,
  user_id uuid NULL,
  viewed_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT post_views_pkey PRIMARY KEY (id),
  CONSTRAINT post_views_post_id_user_id_key UNIQUE (post_id, user_id),
  CONSTRAINT post_views_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
  CONSTRAINT post_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Post views indexes
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON public.post_views USING btree (post_id) TABLESPACE pg_default;

-- Stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  creator_id uuid NULL,
  content_type text NOT NULL,
  media_url text NULL,
  media_path text NULL,
  caption text NULL,
  text_content text NULL,
  text_style jsonb NULL DEFAULT '{}'::jsonb,
  background_style jsonb NULL DEFAULT '{}'::jsonb,
  file_size bigint NULL,
  file_type text NULL,
  duration integer NULL,
  thumbnail_url text NULL,
  is_active boolean NULL DEFAULT true,
  view_count integer NULL DEFAULT 0,
  like_count integer NULL DEFAULT 0,
  share_count integer NULL DEFAULT 0,
  expires_at timestamp with time zone NULL DEFAULT (now() + '24:00:00'::interval),
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT stories_pkey PRIMARY KEY (id),
  CONSTRAINT stories_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT stories_content_type_check CHECK ((content_type = ANY (ARRAY['photo'::text, 'video'::text, 'text'::text])))
) TABLESPACE pg_default;

-- Story interactions table
CREATE TABLE IF NOT EXISTS public.story_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  story_id uuid NULL,
  user_id uuid NULL,
  interaction_type text NOT NULL,
  reaction_emoji text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT story_interactions_pkey PRIMARY KEY (id),
  CONSTRAINT story_interactions_story_id_user_id_interaction_type_key UNIQUE (story_id, user_id, interaction_type),
  CONSTRAINT story_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT story_interactions_interaction_type_check CHECK ((interaction_type = ANY (ARRAY['like'::text, 'share'::text, 'reaction'::text])))
) TABLESPACE pg_default;

-- Story interactions indexes
CREATE INDEX IF NOT EXISTS idx_story_interactions_story_id ON public.story_interactions USING btree (story_id) TABLESPACE pg_default;

-- Story views table
CREATE TABLE IF NOT EXISTS public.story_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  story_id uuid NULL,
  viewer_id uuid NULL,
  viewed_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT story_views_pkey PRIMARY KEY (id),
  CONSTRAINT story_views_story_id_viewer_id_key UNIQUE (story_id, viewer_id),
  CONSTRAINT story_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Story views indexes
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON public.story_views USING btree (story_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_story_views_viewer_id ON public.story_views USING btree (viewer_id) TABLESPACE pg_default;

-- Enable Row Level Security on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- Create triggers for timestamp updates
CREATE TRIGGER trigger_update_comments_updated_at 
  BEFORE UPDATE ON post_comments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_posts_updated_at 
  BEFORE UPDATE ON posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for count updates
CREATE TRIGGER trigger_update_post_comment_count
  AFTER INSERT OR DELETE ON post_comments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_post_comment_count();

CREATE TRIGGER trigger_update_post_like_count
  AFTER INSERT OR DELETE ON post_likes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_post_like_count();

CREATE TRIGGER trigger_update_post_view_count
  AFTER INSERT ON post_views 
  FOR EACH ROW 
  EXECUTE FUNCTION update_post_view_count();

CREATE TRIGGER trigger_update_story_interaction_count
  AFTER INSERT OR DELETE ON story_interactions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_story_interaction_count();

CREATE TRIGGER trigger_update_story_view_count
  AFTER INSERT ON story_views 
  FOR EACH ROW 
  EXECUTE FUNCTION update_story_view_count();

-- Create trigger for hashtag usage tracking
CREATE TRIGGER trigger_posts_hashtag_usage
  AFTER INSERT OR UPDATE OF tags ON posts 
  FOR EACH ROW 
  EXECUTE FUNCTION trigger_update_hashtag_usage();

-- Insert default categories
INSERT INTO public.categories (name, description, icon, slug, sort_order) VALUES
  ('Art & Design', 'Digital art, illustrations, and creative designs', '🎨', 'art-design', 1),
  ('Photography', 'Professional and amateur photography', '📸', 'photography', 2),
  ('Technology', 'Tech reviews, tutorials, and innovations', '💻', 'technology', 3),
  ('Fashion', 'Style, trends, and fashion content', '👗', 'fashion', 4),
  ('Music', 'Musicians, covers, and music content', '🎵', 'music', 5),
  ('Fitness', 'Workouts, health, and wellness', '💪', 'fitness', 6),
  ('Food & Cooking', 'Recipes, cooking tips, and food content', '🍳', 'food-cooking', 7),
  ('Travel', 'Travel experiences and destinations', '✈️', 'travel', 8),
  ('Gaming', 'Gaming content and reviews', '🎮', 'gaming', 9),
  ('Education', 'Educational content and tutorials', '📚', 'education', 10),
  ('Lifestyle', 'Daily life, vlogs, and lifestyle content', '🌟', 'lifestyle', 11),
  ('Business', 'Entrepreneurship and business content', '💼', 'business', 12)
ON CONFLICT (slug) DO NOTHING;

-- Basic RLS policies for public read access

-- Categories policies
CREATE POLICY "Anyone can read categories" ON public.categories
  FOR SELECT TO public USING (is_active = true);

-- Hashtags policies  
CREATE POLICY "Anyone can read hashtags" ON public.hashtags
  FOR SELECT TO public USING (true);

-- Profiles policies
CREATE POLICY "Anyone can read profiles" ON public.profiles
  FOR SELECT TO public USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Anyone can read published posts" ON public.posts
  FOR SELECT TO public USING (status = 'published');

CREATE POLICY "Users can manage own posts" ON public.posts
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Profile categories policies
CREATE POLICY "Anyone can read profile categories" ON public.profile_categories
  FOR SELECT TO public USING (true);

CREATE POLICY "Users can manage own profile categories" ON public.profile_categories
  FOR ALL TO authenticated USING (auth.uid() = profile_id);

-- Creator verifications policies
CREATE POLICY "Users can read own verifications" ON public.creator_verifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own verifications" ON public.creator_verifications
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Payment methods policies
CREATE POLICY "Users can manage own payment methods" ON public.payment_methods
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Post interactions policies
CREATE POLICY "Users can manage own post interactions" ON public.post_likes
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own post saves" ON public.post_saves
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own post views" ON public.post_views
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own poll votes" ON public.poll_votes
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Post comments policies
CREATE POLICY "Anyone can read comments" ON public.post_comments
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.post_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.post_comments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.post_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Stories policies
CREATE POLICY "Anyone can read active stories" ON public.stories
  FOR SELECT TO public USING (is_active = true AND expires_at > now());

CREATE POLICY "Users can manage own stories" ON public.stories
  FOR ALL TO authenticated USING (auth.uid() = creator_id);

-- Story interactions policies
CREATE POLICY "Users can manage own story interactions" ON public.story_interactions
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own story views" ON public.story_views
  FOR ALL TO authenticated USING (auth.uid() = viewer_id);