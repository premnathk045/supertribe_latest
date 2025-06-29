import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { FiHeart, FiMessageCircle, FiShare, FiBookmark } from 'react-icons/fi'
import { useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { usePremiumContent } from '../../../hooks/usePremiumContent'
import { supabase } from '../../../lib/supabase'
import VerifiedBadge from '../../VerifiedBadge'
import PollDisplay from '../../Feed/PollDisplay'
import PaymentMethodModal from '../../Modals/PaymentMethodModal'
import PostOptionsMenu from '../../UI/PostOptionsMenu'
import DeletePostModal from './DeletePostModal'
import Toast from '../../UI/Toast'

function PostsList({ posts, profileData }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [menuOpenPostId, setMenuOpenPostId] = useState(null)
  const [postToDelete, setPostToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState(null)
  const [localPosts, setLocalPosts] = useState(posts)
  
  // Update local posts when props change
  if (JSON.stringify(posts) !== JSON.stringify(localPosts)) {
    setLocalPosts(posts)
  }
  
  const handlePostLike = (postId) => {
    console.log('Like post:', postId)
    // Would implement like functionality here
  }
  
  const handlePostSave = (postId) => {
    console.log('Save post:', postId)
    // Would implement save functionality here
  }
  
  const handlePostComment = (post) => {
    console.log('Comment on post:', post.id)
    // Would open comment modal or section
  }
  
  const handlePostShare = (post) => {
    console.log('Share post:', post.id)
    // Would open share modal
  }
  
  const handlePostClick = (post) => {
    console.log('Open post:', post.id)
    // Navigate to post detail page
    navigate(`/post/${post.id}`)
  }
  
  const handlePollVote = (postId, optionIndex) => {
    console.log(`Vote for option ${optionIndex} in poll ${postId}`)
    // Would implement poll vote functionality here
  }

  const handleDeletePost = async () => {
    if (!postToDelete || !user) return
    
    setIsDeleting(true)
    
    try {
      // Delete post from Supabase
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postToDelete)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      // Remove post from local state
      setLocalPosts(prev => prev.filter(post => post.id !== postToDelete))
      
      // Show success toast
      setToast({
        message: 'Post deleted successfully',
        type: 'success'
      })
      
    } catch (error) {
      console.error('Error deleting post:', error)
      
      // Show error toast
      setToast({
        message: 'Failed to delete post',
        type: 'error'
      })
    } finally {
      setIsDeleting(false)
      setPostToDelete(null)
    }
  }

  const handleEditPost = (postId) => {
    // Navigate to edit post page or open edit modal
    console.log('Edit post:', postId)
  }

  const handleReportPost = () => {
    // Show report dialog
    console.log('Report post')
  }
  
  return (
    <div className="space-y-4 pb-8">
      {localPosts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white border border-gray-100 rounded-lg overflow-hidden"
        >
          {/* Post Header */}
          <div className="flex items-center justify-between p-4">
            <Link to={`/user/${profileData.username}`} className="flex items-center space-x-3">
              <img
                src={profileData.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                alt={profileData.display_name || 'User'}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center space-x-1">
                  <h3 className="font-semibold text-gray-900">{profileData.display_name || profileData.username}</h3>
                  {profileData.is_verified && (
                    <VerifiedBadge size="sm" />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
            </Link>
            
            <PostOptionsMenu
              isOpen={menuOpenPostId === post.id}
              onOpen={() => setMenuOpenPostId(post.id)}
              onClose={() => setMenuOpenPostId(null)}
              onDelete={() => setPostToDelete(post.id)}
              onEdit={() => handleEditPost(post.id)}
              onShare={() => handlePostShare(post)}
              onReport={handleReportPost}
              isCreator={user && user.id === post.user_id}
            />
          </div>
          
          {/* Post Content Section */}
          <div className="px-4 pb-3">
            {post.content && (
              <p className="text-gray-900 leading-relaxed mb-3">{post.content}</p>
            )}
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
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
          </div>
          
          {/* Poll Display */}
          {post.poll && Object.keys(post.poll).length > 0 && (
            <div className="px-4 pb-3">
              <PollDisplay 
                post={post} 
                onVote={handlePollVote} 
              />
            </div>
          )}
          
          {/* Post Media */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className="relative bg-black aspect-square overflow-hidden">
              {/* Determine if it's a video based on file extension */}
              {post.media_urls[0].match(/\.(mp4|webm|mov)$/i) ? (
                <video
                  src={post.media_urls[0]}
                  className="w-full h-full object-cover"
                  controls
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <img
                  src={post.media_urls[0]}
                  alt="Post media"
                  className="w-full h-full object-cover"
                  onClick={() => handlePostClick(post)}
                />
              )}
              
              {/* Multiple Media Indicator */}
              {post.media_urls.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  1/{post.media_urls.length}
                </div>
              )}
              
              {/* Premium Indicator */}
              {post.is_premium && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                  Premium
                </div>
              )}
            </div>
          )}
          
          {/* Post Actions */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => handlePostLike(post.id)}
                  className="text-gray-900 hover:text-red-500 transition-colors"
                >
                  <FiHeart className="text-2xl" />
                </button>
                
                <button
                  onClick={() => handlePostComment(post)}
                  className="text-gray-900 hover:text-gray-600 transition-colors"
                >
                  <FiMessageCircle className="text-2xl" />
                </button>
                
                <button
                  onClick={() => handlePostShare(post)}
                  className="text-gray-900 hover:text-gray-600 transition-colors"
                >
                  <FiShare className="text-2xl" />
                </button>
              </div>
              
              <button
                onClick={() => handlePostSave(post.id)}
                className="text-gray-900 hover:text-gray-600 transition-colors"
              >
                <FiBookmark className="text-2xl" />
              </button>
            </div>
            
            {/* Like Count */}
            {post.like_count > 0 && (
              <p className="font-semibold text-sm text-gray-900 mb-2">
                {post.like_count.toLocaleString()} likes
              </p>
            )}
            
            {/* Comment Count */}
            {post.comment_count > 0 && (
              <button 
                onClick={() => handlePostComment(post)}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors mb-2 block"
              >
                View all {post.comment_count} comments
              </button>
            )}
            
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </motion.div>
      ))}
      
      {/* Delete Post Confirmation Modal */}
      <DeletePostModal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleDeletePost}
        isDeleting={isDeleting}
      />
      
      {/* Payment Method Modal */}
      <PaymentMethodModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
      />
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {localPosts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No posts yet
          </h3>
          <p className="text-gray-500">
            Posts will appear here when they're created
          </p>
        </div>
      )}
    </div>
  )
}

export default PostsList