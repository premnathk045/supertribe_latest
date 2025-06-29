import { supabase } from './supabase'

// Upload media file to Supabase Storage
export const uploadStoryMedia = async (file, userId) => {
  try {
    // Use a fallback extension if file.name is missing (e.g., for Blobs)
    let fileExt = 'bin'
    if (file.name) {
      fileExt = file.name.split('.').pop()
    } else if (file.type && file.type.startsWith('image/')) {
      fileExt = file.type.split('/').pop()
    } else if (file.type && file.type.startsWith('video/')) {
      fileExt = file.type.split('/').pop()
    }
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('story-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading file:', error)
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('story-media')
      .getPublicUrl(fileName)

    return {
      path: fileName,
      url: publicUrl
    }
  } catch (error) {
    console.error('Error in uploadStoryMedia:', error)
    throw error
  }
}

// Create a new story in the database
export const createStory = async (storyData) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .insert([{
        creator_id: storyData.creator_id,
        content_type: storyData.content_type,
        media_url: storyData.media_url,
        media_path: storyData.media_path,
        caption: storyData.caption || null, // Ensure caption is always set
        text_content: storyData.text_content,
        text_style: storyData.text_style || {},
        background_style: storyData.background_style || {},
        file_size: storyData.file_size,
        file_type: storyData.file_type,
        duration: storyData.duration,
        thumbnail_url: storyData.thumbnail_url
      }])
      .select(`
        *,
        profiles!creator_id (
          username,
          display_name,
          avatar_url,
          is_verified,
          user_type
        )
      `)
      .single()

    if (error) {
      console.error('Error creating story:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in createStory:', error)
    throw error
  }
}

// Fetch active stories
export const fetchActiveStories = async () => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        profiles!creator_id (
          username,
          display_name,
          avatar_url,
          is_verified,
          user_type
        )
      `)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching stories:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in fetchActiveStories:', error)
    return []
  }
}

// Mark story as viewed
export const markStoryAsViewed = async (storyId, viewerId) => {
  try {
    // First check if view already exists
    const { data: existingView } = await supabase
      .from('story_views')
      .select('id')
      .eq('story_id', storyId)
      .eq('viewer_id', viewerId)
      .single()

    if (existingView) {
      return // Already viewed
    }

    // Insert new view
    const { error } = await supabase
      .from('story_views')
      .insert([{
        story_id: storyId,
        viewer_id: viewerId
      }])

    if (error && error.code !== '23505') { // Ignore unique constraint violations
      console.error('Error marking story as viewed:', error)
    }
  } catch (error) {
    console.error('Error in markStoryAsViewed:', error)
  }
}

// Get story views for a user's stories
export const getStoryViews = async (creatorId) => {
  try {
    const { data, error } = await supabase
      .from('story_views')
      .select(`
        *,
        stories!inner (creator_id),
        profiles!viewer_id (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('stories.creator_id', creatorId)

    if (error) {
      console.error('Error fetching story views:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getStoryViews:', error)
    return []
  }
}

// Delete a story
export const deleteStory = async (storyId, userId) => {
  try {
    // First get the story to check ownership and get media path
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('creator_id, media_path')
      .eq('id', storyId)
      .single()

    if (fetchError) {
      throw fetchError
    }

    if (story.creator_id !== userId) {
      throw new Error('Unauthorized: Cannot delete story')
    }

    // Delete from storage if media exists
    if (story.media_path) {
      await supabase.storage
        .from('story-media')
        .remove([story.media_path])
    }

    // Delete from database
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Error in deleteStory:', error)
    throw error
  }
}

// Generate thumbnail for video
export const generateVideoThumbnail = (videoFile) => {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      video.currentTime = 1 // Seek to 1 second
    })

    video.addEventListener('seeked', () => {
      ctx.drawImage(video, 0, 0)
      canvas.toBlob(resolve, 'image/jpeg', 0.8)
    })

    video.src = URL.createObjectURL(videoFile)
  })
}