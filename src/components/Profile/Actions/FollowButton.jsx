import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUserPlus, FiUserCheck } from 'react-icons/fi'
import UnfollowConfirmModal from './UnfollowConfirmModal'

function FollowButton({ 
  isFollowing, 
  isLoading, 
  onClick, 
  username,
  className = "" 
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  
  const handleClick = () => {
    if (isFollowing) {
      // Show confirmation modal before unfollowing
      setShowConfirmModal(true)
    } else {
      // Follow directly
      onClick()
    }
  }
  
  const handleConfirmUnfollow = () => {
    onClick()
    setShowConfirmModal(false)
  }
  
  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        disabled={isLoading}
        className={`flex items-center justify-center space-x-2 transition-colors ${
          isFollowing
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            : 'bg-primary-500 hover:bg-primary-600 text-white'
        } ${isLoading ? 'opacity-70 cursor-wait' : ''} ${className}`}
      >
        {isLoading ? (
          <span className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin" />
        ) : isFollowing ? (
          <>
            <FiUserCheck className="text-lg" />
            <span>Following</span>
          </>
        ) : (
          <>
            <FiUserPlus className="text-lg" />
            <span>Follow</span>
          </>
        )}
      </motion.button>
      
      <UnfollowConfirmModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmUnfollow}
        username={username}
      />
    </>
  )
}

export default FollowButton