import { motion } from 'framer-motion'
import { FiEdit3, FiCamera } from 'react-icons/fi'
import VerifiedBadge from '../../VerifiedBadge'
import { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { supabase } from '../../../lib/supabase'

const ProfileHeader = forwardRef(({
  profileData, 
  isOwnProfile, 
  isEditing, 
  editForm, 
  editErrors, 
  handleEditInputChange,
  stats,
  onOpenFollowers,
  onOpenFollowing
}, ref) => {
  const [isHovering, setIsHovering] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  
  // Expose the uploadProfileImage method to parent components
  useImperativeHandle(ref, () => ({
    uploadProfileImage: async () => {
      if (!selectedFile) return null
      return await uploadProfileImage()
    }
  }))
  
  const handleProfilePictureClick = () => {
    if (isEditing && isOwnProfile) {
      fileInputRef.current?.click()
    }
  }
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && isEditing && isOwnProfile) {
      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
        alert('Please select a valid image file (JPG, PNG, or GIF)')
        return
      }
      
      // Validate file size (max 5MB)
      const MAX_SIZE = 5 * 1024 * 1024
      if (file.size > MAX_SIZE) {
        alert(`File size exceeds 5MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`)
        return
      }
      
      // Store the selected file for later upload
      setSelectedFile(file)
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
      
      // Update the form data with the preview URL
      handleEditInputChange('avatar_url', objectUrl)
    }
  }
  
  // Function to upload the profile image to Supabase Storage
  const uploadProfileImage = async () => {
    if (!selectedFile || !profileData?.id) return null
    
    try {
      setIsUploading(true)
      setUploadProgress(0)
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)
      
      // Generate a unique filename
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${profileData.id}/${Date.now()}.${fileExt}`
      
      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) throw error
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      // Clear the selected file and preview
      setSelectedFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      
      // Complete progress
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      return publicUrl
    } catch (error) {
      console.error('Error uploading profile image:', error)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-center space-x-6 mb-6">
      <div className="relative">
        {isEditing ? (
          <div 
            className="relative cursor-pointer"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={handleProfilePictureClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
            <img
              src={previewUrl || editForm.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
              alt={editForm.display_name}
              className={`w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg ${isUploading ? 'opacity-50' : ''}`}
              onError={(e) => {
                e.target.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
              }}
            />
            <motion.div 
              className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovering || isUploading ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isUploading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mb-2"
                  />
                  <span className="text-white text-xs font-medium">{uploadProgress}%</span>
                </>
              ) : (
                <>
                  <FiCamera className="text-white text-2xl mb-2" />
                  <span className="text-white text-xs font-medium">Change Photo</span>
                </>
              )}
            </motion.div>
          </div>
        ) : (
          <img
            src={profileData.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
            alt={profileData.display_name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            onError={(e) => {
              e.target.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
            }}
          />
        )}
        {profileData.user_type === 'creator' && profileData.is_verified && (
          <div className="absolute -bottom-1 -right-1">
            <VerifiedBadge size="lg" className="border-2 border-white rounded-full" />
          </div>
        )}
      </div>
      
      <div className="flex-1">
        {isEditing ? (
          <div className="text-sm text-gray-600">
            <p>Edit your profile information below</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-xl font-bold text-gray-900">{profileData.display_name}</h1>
              {profileData.user_type === 'creator' && profileData.is_verified && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <p className="text-gray-600 mb-3">@{profileData.username}</p>
          </div>
        )}
        
        {/* Stats (merged from ProfileStats component) */}
        <div className="flex space-x-6 text-sm">
          <div className="text-center">
            <div className="font-bold text-gray-900">{stats.postCount}</div>
            <div className="text-gray-600">Posts</div>
          </div>
          <div className="text-center cursor-pointer" onClick={onOpenFollowers}>
            <div className="font-bold text-gray-900">{stats.followerCount}</div>
            <div className="text-gray-600">Followers</div>
          </div>
          <div className="text-center cursor-pointer" onClick={onOpenFollowing}>
            <div className="font-bold text-gray-900">{stats.followingCount}</div>
            <div className="text-gray-600">Following</div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ProfileHeader