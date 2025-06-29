/*
  # Discovery System Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `icon` (text)
      - `slug` (text, unique)
      - `is_active` (boolean)
      - `sort_order` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `hashtags`
      - `id` (uuid, primary key)
      - `tag` (text, unique)
      - `usage_count` (integer)
      - `trending_score` (numeric)
      - `last_used_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `profile_categories` (junction table)
      - `profile_id` (uuid, foreign key)
      - `category_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated user management

  3. Functions
    - Function to update hashtag usage
    - Function to calculate trending scores
    - Function to get discovery data
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text NOT NULL DEFAULT '📁',
  slug text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Hashtags table
CREATE TABLE IF NOT EXISTS hashtags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text UNIQUE NOT NULL,
  usage_count integer DEFAULT 0,
  trending_score numeric DEFAULT 0,
  last_used_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Profile categories junction table
CREATE TABLE IF NOT EXISTS profile_categories (
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (profile_id, category_id)
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (true);

-- Hashtags policies
CREATE POLICY "Anyone can read hashtags"
  ON hashtags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update hashtags"
  ON hashtags
  FOR ALL
  TO authenticated
  USING (true);

-- Profile categories policies
CREATE POLICY "Anyone can read profile categories"
  ON profile_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage own profile categories"
  ON profile_categories
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_hashtags_trending ON hashtags(trending_score DESC, usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_hashtags_tag ON hashtags(tag);
CREATE INDEX IF NOT EXISTS idx_profile_categories_profile ON profile_categories(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_categories_category ON profile_categories(category_id);

-- Insert default categories
INSERT INTO categories (name, description, icon, slug, sort_order) VALUES
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

-- Function to update hashtag usage
CREATE OR REPLACE FUNCTION update_hashtag_usage(tag_name text)
RETURNS void AS $$
BEGIN
  INSERT INTO hashtags (tag, usage_count, last_used_at)
  VALUES (lower(tag_name), 1, now())
  ON CONFLICT (tag) 
  DO UPDATE SET 
    usage_count = hashtags.usage_count + 1,
    last_used_at = now(),
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Function to calculate trending scores
CREATE OR REPLACE FUNCTION calculate_trending_scores()
RETURNS void AS $$
BEGIN
  UPDATE hashtags 
  SET trending_score = (
    usage_count * 0.7 + 
    CASE 
      WHEN last_used_at > now() - interval '24 hours' THEN 50
      WHEN last_used_at > now() - interval '7 days' THEN 20
      WHEN last_used_at > now() - interval '30 days' THEN 5
      ELSE 0
    END
  ),
  updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Function to get discovery data
CREATE OR REPLACE FUNCTION get_discovery_data()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'categories', (
      SELECT json_agg(
        json_build_object(
          'id', c.id,
          'name', c.name,
          'description', c.description,
          'icon', c.icon,
          'slug', c.slug,
          'creator_count', COALESCE(creator_counts.count, 0)
        )
      )
      FROM categories c
      LEFT JOIN (
        SELECT 
          pc.category_id,
          COUNT(DISTINCT p.id) as count
        FROM profile_categories pc
        JOIN profiles p ON pc.profile_id = p.id
        WHERE p.user_type = 'creator' AND p.is_verified = true
        GROUP BY pc.category_id
      ) creator_counts ON c.id = creator_counts.category_id
      WHERE c.is_active = true
      ORDER BY c.sort_order
    ),
    'trending_hashtags', (
      SELECT json_agg(
        json_build_object(
          'tag', h.tag,
          'usage_count', h.usage_count,
          'trending_score', h.trending_score
        )
      )
      FROM hashtags h
      WHERE h.usage_count > 0
      ORDER BY h.trending_score DESC, h.usage_count DESC
      LIMIT 10
    ),
    'suggested_creators', (
      SELECT json_agg(
        json_build_object(
          'id', p.id,
          'username', p.username,
          'display_name', p.display_name,
          'bio', p.bio,
          'avatar_url', p.avatar_url,
          'is_verified', p.is_verified,
          'user_type', p.user_type,
          'categories', creator_categories.categories
        )
      )
      FROM profiles p
      LEFT JOIN (
        SELECT 
          pc.profile_id,
          json_agg(
            json_build_object(
              'id', c.id,
              'name', c.name,
              'icon', c.icon,
              'slug', c.slug
            )
          ) as categories
        FROM profile_categories pc
        JOIN categories c ON pc.category_id = c.id
        WHERE c.is_active = true
        GROUP BY pc.profile_id
      ) creator_categories ON p.id = creator_categories.profile_id
      WHERE p.user_type = 'creator' 
        AND p.is_verified = true
        AND p.username IS NOT NULL
        AND p.display_name IS NOT NULL
      ORDER BY p.created_at DESC
      LIMIT 20
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update hashtag usage when posts are created/updated
CREATE OR REPLACE FUNCTION trigger_update_hashtag_usage()
RETURNS trigger AS $$
DECLARE
  tag_item text;
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.tags IS NOT NULL THEN
      FOREACH tag_item IN ARRAY NEW.tags
      LOOP
        PERFORM update_hashtag_usage(tag_item);
      END LOOP;
    END IF;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on posts table
DROP TRIGGER IF EXISTS trigger_posts_hashtag_usage ON posts;
CREATE TRIGGER trigger_posts_hashtag_usage
  AFTER INSERT OR UPDATE OF tags ON posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_hashtag_usage();

-- Update trending scores daily (this would typically be run as a cron job)
-- For demo purposes, we'll calculate it now
SELECT calculate_trending_scores();