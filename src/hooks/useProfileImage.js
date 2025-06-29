import { useState, useCallback } from 'react'
import { uploadProfileImage, deleteProfileImage } from '../lib/storage'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useProfileImage = () => {
  const { user, updateUserProfile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  /**
   * Upload a profile image and update the user's profile
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

      // Upload the new image
      const { url, path } = await uploadProfileImage(file, user.id)
      
      // Update the user's profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Update the auth context
      await updateUserProfile({ avatar_url: url })

      // Delete the old image if provided
      if (oldImageUrl) {
        await deleteProfileImage(oldImageUrl)
      }

      // Complete progress
      clearInterval(progressInterval)
      setProgress(100)

      return { success: true, url, error: null }
    } catch (err) {
      setError(err.message || 'Failed to upload image')
      return { success: false, url: null, error: err.message || 'Failed to upload image' }
    } finally {
      setUploading(false)
    }
  }, [user, updateUserProfile])

  return {
    uploadImage,
    uploading,
    error,
    progress
  }
}

export default useProfileImage