import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiSmile } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'

function CommentForm({ onSubmit, submitting, placeholder = "Add a comment..." }) {
  const { user } = useAuth()
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!comment.trim()) {
      setError('Comment cannot be empty')
      return
    }

    if (comment.length > 500) {
      setError('Comment must be less than 500 characters')
      return
    }

    try {
      await onSubmit(comment.trim())
      setComment('')
      setError('')
    } catch (err) {
      setError('Failed to post comment')
    }
  }

  const handleInputChange = (e) => {
    setComment(e.target.value)
    if (error) setError('')
  }

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Sign in to leave a comment</p>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 p-4">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <img
          src={user.user_metadata?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50'}
          alt="Your avatar"
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        
        <div className="flex-1 relative">
          <textarea
            value={comment}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={submitting}
            className="w-full px-4 py-3 pr-12 bg-gray-100 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all resize-none disabled:opacity-50"
            rows={1}
            style={{
              minHeight: '44px',
              maxHeight: '120px',
              height: 'auto'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            maxLength={500}
          />
          
          <div className="absolute right-3 bottom-3 flex items-center space-x-2">
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={submitting}
            >
              <FiSmile className="text-lg" />
            </button>
            
            <button
              type="submit"
              disabled={!comment.trim() || submitting}
              className="p-1 text-primary-500 hover:text-primary-600 disabled:text-gray-400 transition-colors"
            >
              {submitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full"
                />
              ) : (
                <FiSend className="text-lg" />
              )}
            </button>
          </div>
        </div>
      </form>
      
      <div className="flex justify-between items-center mt-2 px-11">
        <div></div>
        <span className={`text-xs ${comment.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
          {comment.length}/500
        </span>
      </div>
    </div>
  )
}

export default CommentForm