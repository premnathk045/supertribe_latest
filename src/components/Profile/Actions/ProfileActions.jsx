import { motion } from 'framer-motion'
import { FiMessageCircle, FiMoreHorizontal, FiEdit3, FiSave, FiX } from 'react-icons/fi'
import FollowButton from './FollowButton'

function ProfileActions({
  isOwnProfile, 
  isEditing, 
  isFollowing,
  onToggleFollow,
  setIsEditing, 
  handleSaveProfile, 
  handleCancelEdit, 
  saving 
}) {
  return (
    <div className="flex space-x-3 mb-6">
      {isOwnProfile ? (
        isEditing ? (
          <>
            <motion.button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:shadow-md"
            >
              {saving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <FiSave className="text-lg" />
                  <span>Save Changes</span>
                </>
              )}
            </motion.button>
            <motion.button
              onClick={handleCancelEdit}
              disabled={saving}
              className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-900 py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-300"
            >
              <FiX className="text-lg" />
              <span>Cancel</span>
            </motion.button>
          </>
        ) : (
          <motion.button
            onClick={() => setIsEditing(true)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-300"
          >
            <FiEdit3 className="text-lg" />
            <span>Edit Profile</span>
          </motion.button>
        )
      ) : (
        <>
          <FollowButton 
            isFollowing={isFollowing}
            onClick={onToggleFollow}
            className="flex-1 py-2 px-4 rounded-lg font-medium"
            username="username" // This should ideally come from profileData
          />
          
          <motion.button className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
            <FiMessageCircle className="text-lg" />
            <span>Message</span>
          </motion.button>
          
          <motion.button className="bg-gray-100 hover:bg-gray-200 text-gray-900 p-2 rounded-lg transition-colors">
            <FiMoreHorizontal className="text-lg" />
          </motion.button>
        </>
      )}
    </div>
  )
}

export default ProfileActions