import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useProfileImage = () => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  /**
   * Upload a profile image to Supabase Storage
   * @param {File} file - The image file to upload
   * @param {string} oldImageUrl - The URL of the old image to delete (optional)
   * @returns {Promise<{success: boolean, url: string|null, error: string|null}>}
   */
  const uploadImage = useCallback(async (file, oldImageUrl = null) => {
    if (!user) {
      return { success: false, url: null, error: 'User not authenticated' }
    }

    if (!file) {
      return { success: false, url: null, error: 'No file provided' }
    }

    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10
          if (newProgress >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return newProgress
        })
      }, 300)

      // Generate a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) throw error
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Delete old image if provided
      if (oldImageUrl && oldImageUrl.includes('avatars')) {
        try {
          // Extract the path from the URL
          const oldPath = oldImageUrl.split('avatars/')[1]
          if (oldPath) {
            await supabase.storage
              .from('avatars')
              .remove([oldPath])
          }
        } catch (deleteError) {
          console.warn('Failed to delete old profile image:', deleteError)
          // Continue even if delete fails
        }
      }

      // Complete progress
      clearInterval(progressInterval)
      setProgress(100)

      return { success: true, url: publicUrl, error: null }
    } catch (err) {
      setError(err.message || 'Failed to upload image')
      return { success: false, url: null, error: err.message || 'Failed to upload image' }
    } finally {
      setUploading(false)
    }
  }, [user])

  return {
    uploadImage,
    uploading,
    error,
    progress
  }
}

export default useProfileImage