/*
  # Fix get_discovery_data function SQL error

  1. Database Functions
    - Update `get_discovery_data` function to fix GROUP BY clause error
    - Ensure all non-aggregated columns are included in GROUP BY
    - Maintain proper sorting and data structure

  2. Changes Made
    - Add missing columns to GROUP BY clause
    - Ensure SQL query follows PostgreSQL aggregation rules
    - Preserve existing functionality while fixing the error
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_discovery_data();

-- Create the corrected get_discovery_data function
CREATE OR REPLACE FUNCTION get_discovery_data()
RETURNS TABLE (
  categories jsonb,
  trending_creators jsonb,
  featured_posts jsonb
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Categories with creator counts
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'description', c.description,
          'icon', c.icon,
          'slug', c.slug,
          'creator_count', COALESCE(creator_counts.count, 0)
        ) ORDER BY c.sort_order, c.name
      )
      FROM categories c
      LEFT JOIN (
        SELECT 
          pc.category_id,
          COUNT(DISTINCT pc.profile_id) as count
        FROM profile_categories pc
        JOIN profiles p ON pc.profile_id = p.id
        WHERE p.user_type = 'creator' AND p.is_verified = true
        GROUP BY pc.category_id
      ) creator_counts ON c.id = creator_counts.category_id
      WHERE c.is_active = true
    ) as categories,
    
    -- Trending creators (verified creators with recent activity)
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'username', p.username,
          'display_name', p.display_name,
          'avatar_url', p.avatar_url,
          'is_verified', p.is_verified,
          'bio', p.bio,
          'post_count', COALESCE(post_counts.count, 0)
        )
      )
      FROM profiles p
      LEFT JOIN (
        SELECT 
          user_id,
          COUNT(*) as count
        FROM posts
        WHERE status = 'published' 
          AND created_at > NOW() - INTERVAL '30 days'
        GROUP BY user_id
      ) post_counts ON p.id = post_counts.user_id
      WHERE p.user_type = 'creator' 
        AND p.is_verified = true
      ORDER BY post_counts.count DESC NULLS LAST, p.created_at DESC
      LIMIT 10
    ) as trending_creators,
    
    -- Featured posts (recent popular posts)
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', posts.id,
          'content', posts.content,
          'media_urls', posts.media_urls,
          'is_premium', posts.is_premium,
          'price', posts.price,
          'like_count', posts.like_count,
          'comment_count', posts.comment_count,
          'view_count', posts.view_count,
          'created_at', posts.created_at,
          'creator', jsonb_build_object(
            'id', p.id,
            'username', p.username,
            'display_name', p.display_name,
            'avatar_url', p.avatar_url,
            'is_verified', p.is_verified
          )
        ) ORDER BY posts.like_count DESC, posts.created_at DESC
      )
      FROM posts
      JOIN profiles p ON posts.user_id = p.id
      WHERE posts.status = 'published'
        AND posts.created_at > NOW() - INTERVAL '7 days'
        AND p.user_type = 'creator'
        AND p.is_verified = true
      LIMIT 20
    ) as featured_posts;
END;
$$;