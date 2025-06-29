import { supabase } from './supabase'

// Upload image to Supabase storage
export const uploadMessageImage = async (file, userId) => {
  try {
    if (!file || !userId) {
      throw new Error('File and user ID are required')
    }
    
    // Generate a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    
    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('message-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('message-media')
      .getPublicUrl(fileName)
    
    return {
      path: fileName,
      url: publicUrl,
      type: file.type
    }
  } catch (error) {
    console.error('Error uploading message image:', error)
    throw error
  }
}

// Get file size formatted
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Check if file is valid image
export const isValidImage = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, reason: 'File type not supported. Please upload JPG, PNG, or GIF.' }
  }
  
  if (file.size > MAX_SIZE) {
    return { valid: false, reason: `File too large. Maximum size is ${formatFileSize(MAX_SIZE)}.` }
  }
  
  return { valid: true }
}

// Add long-press handler
export const useLongPress = (callback, ms = 500) => {
  let timer = null
  
  const start = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!timer) {
      timer = setTimeout(() => {
        callback(e)
        timer = null
      }, ms)
    }
  }
  
  const stop = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }
  
  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchEnd: stop
  }
}