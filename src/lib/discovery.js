import { supabase } from './supabase'

// Cache for discovery data
let discoveryCache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000 // 5 minutes
}

// Get all discovery data (categories, trending hashtags, suggested creators)
export const getDiscoveryData = async () => {
  try {
    // Check cache first
    const now = Date.now()
    if (discoveryCache.data && discoveryCache.timestamp && (now - discoveryCache.timestamp) < discoveryCache.ttl) {
      console.log('🔄 Returning cached discovery data')
      return discoveryCache.data
    }

    console.log('🔍 Fetching fresh discovery data from Supabase...')

    // Call the database function
    const { data, error } = await supabase.rpc('get_discovery_data')

    if (error) {
      console.error('❌ Error fetching discovery data:', error)
      throw error
    }

    // Update cache
    discoveryCache = {
      data,
      timestamp: now
    }

    console.log('✅ Discovery data fetched successfully:', data)
    return data
  } catch (error) {
    console.error('❌ Error in getDiscoveryData:', error)
    throw error
  }
}

// Get categories with creator counts
export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        description,
        icon,
        slug,
        profile_categories!inner(
          profiles!inner(
            id,
            user_type,
            is_verified
          )
        )
      `)
      .eq('is_active', true)
      .eq('profile_categories.profiles.user_type', 'creator')
      .eq('profile_categories.profiles.is_verified', true)
      .order('sort_order')

    if (error) throw error

    // Transform data to include creator counts
    const categoriesWithCounts = data.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      slug: category.slug,
      creator_count: category.profile_categories?.length || 0
    }))

    return categoriesWithCounts
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

// Get trending hashtags
export const getTrendingHashtags = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('hashtags')
      .select('tag, usage_count, trending_score')
      .gt('usage_count', 0)
      .order('trending_score', { ascending: false })
      .order('usage_count', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching trending hashtags:', error)
    throw error
  }
}

// Get suggested creators with optional filtering
export const getSuggestedCreators = async (options = {}) => {
  try {
    const {
      limit = 20,
      categorySlug = null,
      searchQuery = null,
      excludeUserIds = []
    } = options

    let query = supabase
      .from('profiles')
      .select(`
        id,
        username,
        display_name,
        bio,
        avatar_url,
        is_verified,
        user_type,
        created_at,
        profile_categories!left(
          categories!inner(
            id,
            name,
            icon,
            slug
          )
        )
      `)
      .eq('user_type', 'creator')
      .eq('is_verified', true)
      .not('username', 'is', null)
      .not('display_name', 'is', null)

    // Filter by category if specified
    if (categorySlug) {
      query = query.eq('profile_categories.categories.slug', categorySlug)
    }

    // Search functionality
    if (searchQuery) {
      const searchTerm = `%${searchQuery.toLowerCase()}%`
      query = query.or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm},bio.ilike.${searchTerm}`)
    }

    // Exclude specific user IDs
    if (excludeUserIds.length > 0) {
      query = query.not('id', 'in', `(${excludeUserIds.join(',')})`)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    // Transform data to include categories array
    const creatorsWithCategories = data.map(creator => ({
      id: creator.id,
      username: creator.username,
      displayName: creator.display_name,
      bio: creator.bio,
      avatar: creator.avatar_url,
      isVerified: creator.is_verified,
      userType: creator.user_type,
      isOnline: Math.random() > 0.5, // Mock online status
      isPremium: creator.is_verified,
      followerCount: Math.floor(Math.random() * 10000) + 100, // Mock follower count
      followingCount: Math.floor(Math.random() * 1000) + 50, // Mock following count
      postCount: Math.floor(Math.random() * 500) + 10, // Mock post count
      categories: creator.profile_categories?.map(pc => pc.categories).filter(Boolean) || []
    }))

    return creatorsWithCategories
  } catch (error) {
    console.error('Error fetching suggested creators:', error)
    throw error
  }
}

// Search creators and content
export const searchDiscovery = async (query, options = {}) => {
  try {
    const { limit = 20, type = 'all' } = options

    if (!query || query.trim().length < 2) {
      return {
        creators: [],
        hashtags: [],
        categories: []
      }
    }

    const searchTerm = query.trim().toLowerCase()
    const results = {}

    // Search creators
    if (type === 'all' || type === 'creators') {
      results.creators = await getSuggestedCreators({
        limit,
        searchQuery: searchTerm
      })
    }

    // Search hashtags
    if (type === 'all' || type === 'hashtags') {
      const { data: hashtagData, error: hashtagError } = await supabase
        .from('hashtags')
        .select('tag, usage_count')
        .ilike('tag', `%${searchTerm}%`)
        .order('usage_count', { ascending: false })
        .limit(10)

      if (hashtagError) throw hashtagError
      results.hashtags = hashtagData || []
    }

    // Search categories
    if (type === 'all' || type === 'categories') {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name, description, icon, slug')
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('sort_order')
        .limit(10)

      if (categoryError) throw categoryError
      results.categories = categoryData || []
    }

    return results
  } catch (error) {
    console.error('Error searching discovery:', error)
    throw error
  }
}

// Get creators by category
export const getCreatorsByCategory = async (categorySlug, options = {}) => {
  try {
    const { limit = 20, offset = 0 } = options

    return await getSuggestedCreators({
      limit,
      categorySlug,
      excludeUserIds: []
    })
  } catch (error) {
    console.error('Error fetching creators by category:', error)
    throw error
  }
}

// Update hashtag usage (called when posts are created/updated)
export const updateHashtagUsage = async (tags) => {
  try {
    if (!Array.isArray(tags) || tags.length === 0) return

    // Update each hashtag
    for (const tag of tags) {
      if (tag && tag.trim()) {
        const { error } = await supabase.rpc('update_hashtag_usage', {
          tag_name: tag.trim().toLowerCase()
        })

        if (error) {
          console.error(`Error updating hashtag usage for "${tag}":`, error)
        }
      }
    }

    // Clear cache to force refresh
    discoveryCache.data = null
    discoveryCache.timestamp = null
  } catch (error) {
    console.error('Error updating hashtag usage:', error)
  }
}

// Calculate trending scores (typically called by a cron job)
export const calculateTrendingScores = async () => {
  try {
    const { error } = await supabase.rpc('calculate_trending_scores')

    if (error) throw error

    // Clear cache to force refresh
    discoveryCache.data = null
    discoveryCache.timestamp = null

    console.log('✅ Trending scores calculated successfully')
  } catch (error) {
    console.error('Error calculating trending scores:', error)
    throw error
  }
}

// Clear discovery cache (useful for testing or manual refresh)
export const clearDiscoveryCache = () => {
  discoveryCache.data = null
  discoveryCache.timestamp = null
  console.log('🗑️ Discovery cache cleared')
}