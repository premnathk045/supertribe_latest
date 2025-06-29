import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiHeart, FiMessageCircle, FiShare, FiBookmark } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import MediaCarousel from '../Media/MediaCarousel'
import CommentsList from '../Comments/CommentsList'
import CommentForm from '../Comments/CommentForm'
import { useComments } from '../../hooks/useComments'
import VerifiedBadge from '../VerifiedBadge'

function PostDetailModal({ isOpen, post, onClose, onShare }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  
  // Use the comments hook for real-time functionality
  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    submitting,
    addComment,
    deleteComment
  } = useComments(post?.id)

  if (!post) return null

  const handleAddComment = async (content) => {
    await addComment(content)
  }

  const handleDeleteComment = async (commentId) => {
    await deleteComment(commentId)
  }

  const handleReplyToComment = (comment) => {
    // TODO: Implement reply functionality
    console.log('Reply to comment:', comment)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-lg max-h-[90vh] bg-white rounded-3xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <img
                  src={post.user.avatar}
                  alt={post.user.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-1">
                    <h3 className="font-semibold text-gray-900">{post.user.displayName}</h3>
                    {post.user.isVerified && (
                      <VerifiedBadge size="sm" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Media */}
              <MediaCarousel
                media={post.media}
                currentIndex={currentMediaIndex}
                onIndexChange={setCurrentMediaIndex}
              />

              {/* Post Content */}
              <div className="p-4">
                <p className="text-gray-900 leading-relaxed mb-3">{post.content}</p>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-primary-500 text-sm hover:underline cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between py-3 border-y border-gray-200">
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-1 text-gray-700 hover:text-red-500 transition-colors">
                      <FiHeart className="text-xl" />
                      <span className="font-medium">{post.likeCount}</span>
                    </button>
                    
                    <button className="flex items-center space-x-1 text-gray-700 hover:text-primary-500 transition-colors">
                      <FiMessageCircle className="text-xl" />
                      <span className="font-medium">{post.commentCount}</span>
                    </button>
                    
                    <button 
                      onClick={onShare}
                      className="flex items-center space-x-1 text-gray-700 hover:text-primary-500 transition-colors"
                    >
                      <FiShare className="text-xl" />
                      <span className="font-medium">{post.shareCount}</span>
                    </button>
                  </div>
                  
                  <button className="text-gray-700 hover:text-primary-500 transition-colors">
                    <FiBookmark className="text-xl" />
                  </button>
                </div>

                {/* Comments Section */}
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">
                      Comments {comments.length > 0 && `(${comments.length})`}
                    </h4>
                  </div>
                  
                  {/* Comments List */}
                  <CommentsList
                    comments={comments}
                    loading={commentsLoading}
                    error={commentsError}
                    onDeleteComment={handleDeleteComment}
                    onReplyToComment={handleReplyToComment}
                  />
                </div>
              </div>
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-gray-200">
              <CommentForm
                onSubmit={handleAddComment}
                submitting={submitting}
                placeholder="Add a comment..."
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PostDetailModal