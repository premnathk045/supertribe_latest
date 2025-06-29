import { supabase } from './supabase'

/**
 * Uploads a profile image to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} userId - The user's ID
 * @returns {Promise<{path: string, url: string}>} - The file path and public URL
 */
export const uploadProfileImage = async (file, userId) => {
  try {
    if (!file || !userId) {
      throw new Error('File and user ID are required')
    }
    
    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
      throw new Error('Invalid file type. Please upload a JPG, PNG, or GIF image.')
    }
    
    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      throw new Error(`File size exceeds 5MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`)
    }
    
    // Generate a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    
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
    
    return {
      path: fileName,
      url: publicUrl
    }
  } catch (error) {
    console.error('Error uploading profile image:', error)
    throw error
  }
}

/**
 * Deletes an old profile image from Supabase Storage
 * @param {string} filePath - The path of the file to delete
 * @returns {Promise<boolean>} - Whether the deletion was successful
 */
export const deleteProfileImage = async (filePath) => {
  try {
    if (!filePath) return false
    
    // Extract the path from the URL if it's a full URL
    if (filePath.startsWith('http')) {
      const url = new URL(filePath)
      const pathParts = url.pathname.split('/')
      // Remove the first empty string and 'storage/v1/object/public'
      const relevantParts = pathParts.slice(5)
      filePath = relevantParts.join('/')
    }
    
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath])
    
    if (error) throw error
    
    return true
  } catch (error) {
    console.error('Error deleting profile image:', error)
    return false
  }
}