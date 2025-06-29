import { motion } from 'framer-motion'
import { FiEdit3, FiCamera, FiUpload } from 'react-icons/fi'
import VerifiedBadge from '../../VerifiedBadge'
import { useState, useRef, useEffect } from 'react'
import useProfileImage from '../../../hooks/useProfileImage'

function ProfileHeader({
  profileData, 
  isOwnProfile, 
  isEditing, 
  editForm, 
  editErrors, 
  handleEditInputChange,
  stats,
  onOpenFollowers,
  onOpenFollowing
}) {
  const [isHovering, setIsHovering] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)
  const { uploadImage, uploading, error, progress } = useProfileImage()
  
  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])
  
  const handleProfilePictureClick = () => {
    if (isEditing && isOwnProfile) {
      fileInputRef.current?.click()
    }
  }
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && isEditing && isOwnProfile) {
      // Store the selected file for later upload
      setSelectedFile(file)
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file)
      setPreviewUrl(previewUrl)
      
      // Update the form data with the new URL
      handleEditInputChange('avatar_url', previewUrl)
    }
  }
  
  // Function to handle the actual upload when user saves profile
  const uploadProfileImage = async () => {
    if (!selectedFile || !isOwnProfile) return null
    
    try {
      // Upload the image and get the URL
      const result = await uploadImage(selectedFile, profileData.avatar_url)
      
      if (result.success) {
        // Clear the selected file and preview
        setSelectedFile(null)
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
          setPreviewUrl(null)
        }
        
        return result.url
      } else {
        throw new Error(result.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading profile image:', error)
      return null
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
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={handleFileChange}
            />
            <img
              src={editForm.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
              alt={editForm.display_name}
              className={`w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg ${uploading ? 'opacity-50' : ''}`}
              onError={(e) => {
                e.target.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
              }}
            />
            <motion.div 
              className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovering || uploading ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {uploading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mb-2"
                  />
                  <span className="text-white text-xs font-medium">{progress}%</span>
                </>
              ) : (
                <>
                  <FiUpload className="text-white text-2xl mb-2" />
                  <span className="text-white text-sm font-medium">Change Photo</span>
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
          <div className="absolute bottom-2 right-2">
            <VerifiedBadge size="lg" className="border-2 border-white rounded-full shadow-md" />
          </div>
        )}
      </div>
      
      <div className="flex-1 ml-4">
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
          <div className="text-center cursor-pointer">
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
}

// Add the uploadProfileImage method to the component
ProfileHeader.uploadProfileImage = function(ref) {
  return ref?.uploadProfileImage?.()
}

export default ProfileHeader