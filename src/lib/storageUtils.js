import { supabase } from './supabase'

// Verify storage bucket configuration
export const verifyStorageBuckets = async () => {
  try {
    console.log('🔍 Verifying storage buckets...')
    
    // Check if buckets exist
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Error fetching buckets:', error)
      return false
    }
    
    const storyMediaBucket = buckets.find(bucket => bucket.id === 'story-media')
    const storyThumbnailsBucket = buckets.find(bucket => bucket.id === 'story-thumbnails')
    
    console.log('📦 Available buckets:', buckets.map(b => b.id))
    
    if (!storyMediaBucket) {
      console.error('❌ story-media bucket not found')
      return false
    }
    
    if (!storyThumbnailsBucket) {
      console.error('❌ story-thumbnails bucket not found')
      return false
    }
    
    console.log('✅ story-media bucket found:', storyMediaBucket)
    console.log('✅ story-thumbnails bucket found:', storyThumbnailsBucket)
    
    return true
  } catch (error) {
    console.error('❌ Error verifying storage buckets:', error)
    return false
  }
}

// Test upload functionality
export const testStorageUpload = async (userId) => {
  try {
    console.log('🧪 Testing storage upload...')
    
    // Create a small test file
    const testContent = 'test-story-upload'
    const testFile = new Blob([testContent], { type: 'text/plain' })
    const testFileName = `${userId}/test-${Date.now()}.txt`
    
    // Test upload
    const { data, error } = await supabase.storage
      .from('story-media')
      .upload(testFileName, testFile)
    
    if (error) {
      console.error('❌ Test upload failed:', error)
      return false
    }
    
    console.log('✅ Test upload successful:', data)
    
    // Test public URL generation
    const { data: { publicUrl } } = supabase.storage
      .from('story-media')
      .getPublicUrl(testFileName)
    
    console.log('✅ Public URL generated:', publicUrl)
    
    // Clean up test file
    await supabase.storage
      .from('story-media')
      .remove([testFileName])
    
    console.log('✅ Test file cleaned up')
    
    return true
  } catch (error) {
    console.error('❌ Storage test failed:', error)
    return false
  }
}

// Get storage usage statistics
export const getStorageStats = async () => {
  try {
    const { data: storyMediaFiles, error: mediaError } = await supabase.storage
      .from('story-media')
      .list()
    
    const { data: thumbnailFiles, error: thumbnailError } = await supabase.storage
      .from('story-thumbnails')
      .list()
    
    if (mediaError || thumbnailError) {
      console.error('Error fetching storage stats:', { mediaError, thumbnailError })
      return null
    }
    
    return {
      storyMediaCount: storyMediaFiles?.length || 0,
      thumbnailCount: thumbnailFiles?.length || 0,
      storyMediaFiles: storyMediaFiles || [],
      thumbnailFiles: thumbnailFiles || []
    }
  } catch (error) {
    console.error('Error getting storage stats:', error)
    return null
  }
}

// Manual cleanup of expired stories
export const cleanupExpiredStories = async () => {
  try {
    console.log('🧹 Starting manual cleanup of expired stories...')
    
    // Call the database function
    const { error } = await supabase.rpc('cleanup_expired_story_media')
    
    if (error) {
      console.error('❌ Cleanup failed:', error)
      return false
    }
    
    console.log('✅ Cleanup completed successfully')
    return true
  } catch (error) {
    console.error('❌ Cleanup error:', error)
    return false
  }
}

// Check storage policies
export const checkStoragePolicies = async () => {
  try {
    console.log('🔐 Checking storage policies...')
    
    // This would require admin access to check policies
    // For now, we'll test by attempting operations
    
    const testResults = {
      canUpload: false,
      canRead: false,
      canDelete: false
    }
    
    // Test upload (requires auth)
    try {
      const testFile = new Blob(['test'], { type: 'text/plain' })
      const { error } = await supabase.storage
        .from('story-media')
        .upload(`test-policy-${Date.now()}.txt`, testFile)
      
      testResults.canUpload = !error
      if (!error) {
        // Clean up
        await supabase.storage
          .from('story-media')
          .remove([`test-policy-${Date.now()}.txt`])
      }
    } catch (e) {
      console.log('Upload test failed (expected if not authenticated)')
    }
    
    // Test read (should work for public)
    try {
      const { data, error } = await supabase.storage
        .from('story-media')
        .list('', { limit: 1 })
      
      testResults.canRead = !error
    } catch (e) {
      console.log('Read test failed')
    }
    
    console.log('📊 Policy test results:', testResults)
    return testResults
  } catch (error) {
    console.error('❌ Policy check failed:', error)
    return null
  }
}