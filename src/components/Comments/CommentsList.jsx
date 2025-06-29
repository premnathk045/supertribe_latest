import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageCircle } from 'react-icons/fi'
import CommentItem from './CommentItem'
import LoadingSpinner from '../UI/LoadingSpinner'

function CommentsList({ comments, loading, error, onDeleteComment, onReplyToComment }) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">
          <FiMessageCircle className="text-2xl mx-auto mb-2" />
          <p className="text-sm">Failed to load comments</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-primary-500 hover:text-primary-600 text-sm font-medium"
        >
          Try again
        </button>
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <FiMessageCircle className="text-4xl text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No comments yet</h3>
        <p className="text-gray-600 text-sm">Be the first to leave a comment!</p>
      </div>
    )
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      <AnimatePresence>
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onDelete={onDeleteComment}
            onReply={onReplyToComment}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default CommentsList