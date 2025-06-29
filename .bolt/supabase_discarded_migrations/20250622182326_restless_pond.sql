/*
  # Fix get_discovery_data function

  1. Database Function Fix
    - Corrects the `get_discovery_data` function to properly handle GROUP BY clause
    - Ensures all non-aggregated columns are included in GROUP BY
    - Maintains the expected return structure for the discovery page

  2. Changes Made
    - Fixed SQL aggregation issues in the discovery data query
    - Properly grouped columns to avoid PostgreSQL GROUP BY errors
    - Maintained compatibility with existing frontend code
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_discovery_data();

-- Create the corrected get_discovery_data function
CREATE OR REPLACE FUNCTION get_discovery_data()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH trending_creators AS (
    SELECT 
      p.id,
      p.username,
      p.display_name,
      p.avatar_url,
      p.bio,
      p.is_verified,
      COALESCE(post_stats.post_count, 0) as post_count,
      COALESCE(post_stats.total_likes, 0) as total_likes,
      COALESCE(post_stats.total_views, 0) as total_views
    FROM profiles p
    LEFT JOIN (
      SELECT 
        user_id,
        COUNT(*) as post_count,
        SUM(like_count) as total_likes,
        SUM(view_count) as total_views
      FROM posts 
      WHERE status = 'published' 
        AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY user_id
    ) post_stats ON p.id = post_stats.user_id
    WHERE p.user_type = 'creator' 
      AND p.is_verified = true
    ORDER BY 
      COALESCE(post_stats.total_likes, 0) + 
      COALESCE(post_stats.total_views, 0) DESC
    LIMIT 20
  ),
  trending_posts AS (
    SELECT 
      p.id,
      p.content,
      p.media_urls,
      p.is_premium,
      p.price,
      p.tags,
      p.like_count,
      p.comment_count,
      p.view_count,
      p.created_at,
      pr.username,
      pr.display_name,
      pr.avatar_url,
      pr.is_verified
    FROM posts p
    JOIN profiles pr ON p.user_id = pr.id
    WHERE p.status = 'published'
      AND p.created_at >= NOW() - INTERVAL '24 hours'
    ORDER BY 
      (p.like_count * 2 + p.view_count + p.comment_count * 3) DESC
    LIMIT 20
  ),
  trending_hashtags AS (
    SELECT 
      tag,
      usage_count,
      trending_score
    FROM hashtags
    WHERE last_used_at >= NOW() - INTERVAL '7 days'
    ORDER BY trending_score DESC, usage_count DESC
    LIMIT 10
  ),
  categories_data AS (
    SELECT 
      c.id,
      c.name,
      c.description,
      c.icon,
      c.slug,
      COUNT(pc.profile_id) as creator_count
    FROM categories c
    LEFT JOIN profile_categories pc ON c.id = pc.category_id
    WHERE c.is_active = true
    GROUP BY c.id, c.name, c.description, c.icon, c.slug, c.sort_order
    ORDER BY c.sort_order, creator_count DESC
  )
  
  SELECT json_build_object(
    'trending_creators', COALESCE(
      (SELECT json_agg(row_to_json(tc)) FROM trending_creators tc), 
      '[]'::json
    ),
    'trending_posts', COALESCE(
      (SELECT json_agg(row_to_json(tp)) FROM trending_posts tp), 
      '[]'::json
    ),
    'trending_hashtags', COALESCE(
      (SELECT json_agg(row_to_json(th)) FROM trending_hashtags th), 
      '[]'::json
    ),
    'categories', COALESCE(
      (SELECT json_agg(row_to_json(cd)) FROM categories_data cd), 
      '[]'::json
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_discovery_data() TO authenticated;
GRANT EXECUTE ON FUNCTION get_discovery_data() TO anon;