import { motion } from 'framer-motion'
import { FiMessageCircle, FiMoreHorizontal } from 'react-icons/fi'
import FollowButton from './FollowButton'

function ViewProfileActions({ 
  isFollowing, 
  isLoading,
  profileData,
  onToggleFollow, 
  onSendMessage 
}) {
  return (
    <div className="flex space-x-3 mb-6">
      <FollowButton
        isFollowing={isFollowing}
        isLoading={isLoading}
        onClick={onToggleFollow}
        username={profileData?.username}
        className="flex-1 py-2 px-4 rounded-lg font-medium"
      />
      
      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={onSendMessage}
        className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
      >
        <FiMessageCircle className="text-lg" />
        <span>Message</span>
      </motion.button>
      
      <motion.button 
        whileTap={{ scale: 0.95 }}
        className="bg-gray-100 hover:bg-gray-200 text-gray-900 p-2 rounded-lg transition-colors"
      >
        <FiMoreHorizontal className="text-lg" />
      </motion.button>
    </div>
  )
}

export default ViewProfileActions