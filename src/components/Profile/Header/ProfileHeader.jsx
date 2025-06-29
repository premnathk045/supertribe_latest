import { motion } from 'framer-motion'
import { FiEdit3, FiCamera, FiUpload } from 'react-icons/fi'
import VerifiedBadge from '../../VerifiedBadge'
import { useState, useRef } from 'react'

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
  const fileInputRef = useRef(null)
  
  const handleProfilePictureClick = () => {
    if (isEditing && isOwnProfile) {
      fileInputRef.current?.click()
    }
  }
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file)
      // Update the form data with the new URL
      handleEditInputChange('avatar_url', previewUrl)
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
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              onError={(e) => {
                e.target.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
              }}
            />
            <motion.div 
              className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovering ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FiUpload className="text-white text-2xl mb-2" />
              <span className="text-white text-sm font-medium">Change Photo</span>
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

export default ProfileHeader