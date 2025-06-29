import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMoreHorizontal, FiTrash2, FiHeart, FiMessageCircle } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../../contexts/AuthContext'
import VerifiedBadge from '../VerifiedBadge'

function CommentItem({ comment, onDelete, onReply }) {
  const { user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [deleting, setDeleting] = useState(false)

  const isOwnComment = user && comment.user_id === user.id
  const isOptimistic = comment.isOptimistic

  const handleDelete = async () => {
    if (!isOwnComment || deleting) return

    setDeleting(true)
    try {
      await onDelete(comment.id)
    } catch (error) {
      console.error('Failed to delete comment:', error)
    } finally {
      setDeleting(false)
      setShowMenu(false)
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isOptimistic ? 0.7 : 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex space-x-3 p-4 ${isOptimistic ? 'bg-gray-50' : ''}`}
    >
      <img
        src={comment.profiles?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50'}
        alt={comment.profiles?.display_name || 'User'}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 rounded-2xl px-4 py-3">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold text-gray-900 text-sm">
              {comment.profiles?.display_name || 'Unknown User'}
            </h4>
            {comment.profiles?.is_verified && (
              <VerifiedBadge size="sm" />
            )}
            {isOptimistic && (
              <span className="text-xs text-gray-500 italic">Posting...</span>
            )}
          </div>
          <p className="text-gray-900 text-sm leading-relaxed break-words">
            {comment.content}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-2 px-2">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                isLiked ? 'text-red-500' : ''
              }`}
            >
              <FiHeart className={`text-sm ${isLiked ? 'fill-current' : ''}`} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
            
            <button
              onClick={() => onReply && onReply(comment)}
              className="hover:text-primary-500 transition-colors"
            >
              Reply
            </button>
          </div>
          
          {isOwnComment && !isOptimistic && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <FiMoreHorizontal className="text-sm text-gray-500" />
              </button>
              
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden"
                >
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {deleting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"
                      />
                    ) : (
                      <FiTrash2 className="text-sm" />
                    )}
                    <span>Delete</span>
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default CommentItem