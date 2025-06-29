import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCalendar, FiEdit3, FiTrash2, FiClock } from 'react-icons/fi'
import { format, isAfter } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../UI/LoadingSpinner'

function ScheduledPostsModal({ isOpen, onClose, onEditPost }) {
  const { user } = useAuth()
  const [scheduledPosts, setScheduledPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingPostId, setDeletingPostId] = useState(null)

  useEffect(() => {
    if (isOpen && user) {
      fetchScheduledPosts()
    }
  }, [isOpen, user])

  const fetchScheduledPosts = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          media_urls,
          is_premium,
          price,
          tags,
          scheduled_for,
          created_at
        `)
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .order('scheduled_for', { ascending: true })

      if (error) {
        throw error
      }

      setScheduledPosts(data || [])
    } catch (error) {
      console.error('Error fetching scheduled posts:', error)
      setError('Failed to load scheduled posts')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId) => {
    try {
      setDeletingPostId(postId)

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      setScheduledPosts(prev => prev.filter(post => post.id !== postId))
    } catch (error) {
      console.error('Error deleting scheduled post:', error)
      setError('Failed to delete post')
    } finally {
      setDeletingPostId(null)
    }
  }

  const handlePublishNow = async (postId) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          status: 'published',
          scheduled_for: null,
          created_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      setScheduledPosts(prev => prev.filter(post => post.id !== postId))
    } catch (error) {
      console.error('Error publishing post:', error)
      setError('Failed to publish post')
    }
  }

  const getPostPreview = (post) => {
    if (post.media_urls && post.media_urls.length > 0) {
      return post.media_urls[0]
    }
    return null
  }

  const truncateContent = (content, maxLength = 100) => {
    if (!content) return 'No content'
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Scheduled Posts</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : scheduledPosts.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <FiCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Scheduled Posts
                </h3>
                <p className="text-gray-600">
                  Posts you schedule will appear here
                </p>
              </div>
            ) : (
              /* Posts List */
              <div className="space-y-4">
                {scheduledPosts.map((post, index) => {
                  const isOverdue = !isAfter(new Date(post.scheduled_for), new Date())
                  const previewImage = getPostPreview(post)

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 border rounded-xl ${
                        isOverdue ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex space-x-3">
                        {/* Preview Image */}
                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt="Post preview"
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiCalendar className="text-gray-400 text-xl" />
                          </div>
                        )}

                        {/* Post Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium mb-1">
                            {truncateContent(post.content)}
                          </p>
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                            <FiClock className="text-xs" />
                            <span>
                              {format(new Date(post.scheduled_for), 'MMM dd, yyyy \'at\' h:mm a')}
                            </span>
                            {isOverdue && (
                              <span className="text-orange-600 font-medium">(Overdue)</span>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 text-xs">
                            {post.is_premium && (
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                Premium ${post.price}
                              </span>
                            )}
                            {post.tags && post.tags.length > 0 && (
                              <span className="text-gray-500">
                                {post.tags.length} tag{post.tags.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                        <div className="flex space-x-2">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onEditPost(post)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            <FiEdit3 className="text-xs" />
                            <span>Edit</span>
                          </motion.button>
                          
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeletePost(post.id)}
                            disabled={deletingPostId === post.id}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50"
                          >
                            {deletingPostId === post.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <FiTrash2 className="text-xs" />
                            )}
                            <span>Delete</span>
                          </motion.button>
                        </div>

                        {isOverdue && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePublishNow(post.id)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                          >
                            Publish Now
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Footer */}
            {!loading && scheduledPosts.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-center text-sm text-gray-500">
                  {scheduledPosts.length} scheduled post{scheduledPosts.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ScheduledPostsModal