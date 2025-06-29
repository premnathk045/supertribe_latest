import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  FiHeart, 
  FiMessageCircle, 
  FiShare, 
  FiBookmark, 
  FiLock,
  FiVolume2,
  FiVolumeX,
  FiPlay,
  FiPause
} from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../../contexts/AuthContext'
import { usePremiumContent } from '../../hooks/usePremiumContent'
import PaymentMethodModal from '../Modals/PaymentMethodModal'
import VerifiedBadge from '../VerifiedBadge'
import PostOptionsMenu from '../UI/PostOptionsMenu'
import PollDisplay from './PollDisplay'

function PostCard({ post, onLike, onSave, onComment, onShare, onClick, onPollVote, onDelete, isInView = true }) {
  const { user } = useAuth()
  const { 
    unlockContent, 
    unlocking, 
    showPaymentModal, 
    setShowPaymentModal, 
    isCreator, 
    hasPurchased 
  } = usePremiumContent(post.id)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDoubleTabbed, setIsDoubleTabbed] = useState(false)
  const videoRef = useRef(null)
  const progressInterval = useRef(null)
  const hideControlsTimeout = useRef(null)

  // Prepare media array: preview video (if exists) first, then media_urls
  let media = []
  if (post.preview_video_url) {
    media.push({
      type: 'video',
      url: post.preview_video_url,
      thumbnail: '', 
      isPreview: true,
      description: "Preview video"
    })
  }
  if (Array.isArray(post.media_urls)) {
    post.media_urls.forEach((url) => {
      const ext = url.split('.').pop().toLowerCase()
      media.push({
        type: ext === 'mp4' || ext === 'webm' || ext === 'mov' ? 'video' : 'image',
        url,
        thumbnail: url, 
        isPreview: false,
        description: `${post.user?.displayName || post.profiles?.display_name || ''}'s post`
      })
    })
  }
  
  // Fallback placeholder
  if (media.length === 0) {
    media = [{
      type: 'image',
      url: 'https://images.pexels.com/photos/1149831/pexels-photo-1149831.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      thumbnail: '',
      isPreview: false,
      description: "Placeholder image"
    }]
  }

  const isCurrentPreview = media[currentMediaIndex]?.isPreview
  const currentMedia = media[currentMediaIndex]
  const isVideo = currentMedia?.type === 'video'
  const hasPoll = post?.poll && Object.keys(post.poll || {}).length > 0

  // Determine if content should be locked
  const shouldLockContent = post?.is_premium && !isCreator && !hasPurchased

  const handleUnlockContent = async (e) => {
    e.stopPropagation()
    if (!user) {
      // Redirect to sign in
      window.location.href = '/?auth=signin'
      return
    }
    
    const result = await unlockContent(post.id, post.price)
    
    if (result.success) {
      // Refresh the post to show unlocked content
      window.location.reload()
    }
  }

  // Auto-play video when in view
  useEffect(() => {
    if (videoRef.current && isVideo) {
      if (isInView) {
        videoRef.current.play().then(() => {
          setIsPlaying(true)
        }).catch(err => {
          console.log('Auto-play prevented:', err)
        })
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }, [isInView, currentMediaIndex, isVideo])

  // Progress tracking
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      progressInterval.current = setInterval(() => {
        const video = videoRef.current
        if (video) {
          setProgress((video.currentTime / video.duration) * 100)
        }
      }, 100)
    } else {
      clearInterval(progressInterval.current)
    }

    return () => clearInterval(progressInterval.current)
  }, [isPlaying])

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      clearTimeout(hideControlsTimeout.current)
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    return () => clearTimeout(hideControlsTimeout.current)
  }, [showControls])

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVideoClick = (e) => {
    e.stopPropagation()
    setShowControls(true)
  }

  const handleDeletePost = () => {
    if (onDelete) {
      onDelete(post.id)
    }
  }

  const handleEditPost = () => {
    // Navigate to edit post page or open edit modal
    console.log('Edit post:', post.id)
  }

  const handleReportPost = () => {
    // Show report dialog
    console.log('Report post:', post.id)
  }

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    setIsDoubleTabbed(true)
    onLike()
    setTimeout(() => setIsDoubleTabbed(false), 1000)
  }

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      videoRef.current.muted = isMuted
    }
  }

  const nextMedia = () => {
    if (currentMediaIndex < media.length - 1) {
      setCurrentMediaIndex(prev => prev + 1)
    }
  }

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(prev => prev - 1)
    }
  }

  return (
    <motion.article 
      className="bg-white border border-gray-100 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Link to={`/user/${post.user?.username || post.profiles?.username}`}>
              <img
                src={post.user?.avatar || post.profiles?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40'}
                alt={post.user?.displayName || post.profiles?.display_name || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-gradient-to-r from-purple-500 to-pink-500 p-0.5"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 -z-10"></div>
            </Link>
          </div>
          <div>
            <Link to={`/user/${post.user?.username || post.profiles?.username}`}>
              <div className="flex items-center space-x-1">
                <h3 className="font-semibold text-sm text-gray-900">
                  {post.user?.displayName || post.profiles?.display_name || post.user?.username || post.profiles?.username || 'Unknown'}
                </h3>
                {(post.user?.isVerified || post.profiles?.is_verified) && (
                  <VerifiedBadge size="xs" />
                )}
              </div>
            </Link>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt || post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        <PostOptionsMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onDelete={handleDeletePost}
          onEdit={handleEditPost}
          onShare={() => onShare(post)}
          onReport={handleReportPost}
          isCreator={user && (user.id === post.user_id || user.id === post.user?.id)}
        />
      </div>

      {/* Media Container */}
      {!hasPoll && <div className="relative bg-black aspect-square overflow-hidden">
        {/* Premium Content Overlay - Only show if not creator and not purchased */}
        {shouldLockContent && !isCurrentPreview && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="text-center text-white">
              <FiLock className="text-4xl mx-auto mb-3" />
              <p className="font-semibold text-lg">Premium Content</p>
              <p className="text-sm opacity-90 mb-4">${post.price?.toFixed(2)}</p>
              <button 
                onClick={handleUnlockContent}
                className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors disabled:opacity-70"
                disabled={unlocking}
              >
                {unlocking ? 'Processing...' : isCreator ? 'View' : 'Unlock'}
              </button>
            </div>
          </div>
        )}

        {/* Media Navigation Dots */}
        {media.length > 1 && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10 flex space-x-1">
            {media.map((_, index) => (
              <div
                key={index}
                className={`h-0.5 rounded-full transition-all duration-300 ${
                  index === currentMediaIndex 
                    ? 'bg-white w-8' 
                    : 'bg-white/50 w-6'
                }`}
              />
            ))}
          </div>
        )}

        {/* Video Progress Bar */}
        {isVideo && isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30 z-10">
            <div 
              className="h-full bg-white transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Media Content */}
        {isVideo ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={currentMedia.url}
              className="w-full h-full object-cover"
              muted={isMuted}
              loop
              playsInline
              onLoadedMetadata={handleVideoLoad}
              onEnded={() => setIsPlaying(false)}
              onClick={handleVideoClick}
              onDoubleClick={handleDoubleClick}
            />
            
            {/* Video Controls Overlay */}
            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/20 flex items-center justify-center z-10"
                >
                  <div className="flex items-center space-x-4">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={togglePlayPause}
                      className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm"
                    >
                      {isPlaying ? (
                        <FiPause className="text-white text-xl ml-0.5" />
                      ) : (
                        <FiPlay className="text-white text-xl ml-1" />
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mute/Unmute Button */}
            <button
              onClick={toggleMute}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm z-10"
            >
              {isMuted ? (
                <FiVolumeX className="text-white text-sm" />
              ) : (
                <FiVolume2 className="text-white text-sm" />
              )}
            </button>

            {/* Double-tap heart animation */}
            <AnimatePresence>
              {isDoubleTabbed && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                >
                  <FiHeart className="text-red-500 text-8xl fill-current drop-shadow-lg" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <img
            src={currentMedia.url}
            alt={currentMedia.description}
            className="w-full h-full object-cover"
            onDoubleClick={handleDoubleClick}
          />
        )}

        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            {currentMediaIndex > 0 && (
              <button
                onClick={prevMedia}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm z-10"
              >
                <span className="text-white text-sm">‹</span>
              </button>
            )}
            {currentMediaIndex < media.length - 1 && (
              <button
                onClick={nextMedia}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm z-10"
              >
                <span className="text-white text-sm">›</span>
              </button>
            )}
          </>
        )}
      </div>}
      
      {/* Payment Method Modal */}
      <PaymentMethodModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
      />

      {/* Poll Display */}
      {hasPoll && (
        <PollDisplay 
          post={post || {}} 
          onVote={onPollVote} 
          compact={true} 
        />
      )}

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={onLike}
              className={`${
                post.isLiked ? 'text-red-500' : 'text-gray-900'
              } hover:text-red-500 transition-colors`}
            >
              <FiHeart 
                className={`text-2xl ${post.isLiked ? 'fill-current' : ''}`} 
              />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={onComment}
              className="text-gray-900 hover:text-gray-600 transition-colors"
            >
              <FiMessageCircle className="text-2xl" />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={onShare}
              className="text-gray-900 hover:text-gray-600 transition-colors"
            >
              <FiShare className="text-2xl" />
            </motion.button>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={onSave}
            className={`${
              post.isSaved ? 'text-gray-900 fill-current' : 'text-gray-900'
            } hover:text-gray-600 transition-colors`}
          >
            <FiBookmark className={`text-2xl ${post.isSaved ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Like count */}
        {(post.likeCount ?? post.like_count ?? 0) > 0 && (
          <p className="font-semibold text-sm text-gray-900 mb-2">
            {(post.likeCount ?? post.like_count).toLocaleString()} likes
          </p>
        )}

        {/* Content */}
        {post.content && (
          <div className="mb-2">
            <p
              className="text-sm text-gray-900 cursor-pointer hover:underline"
              onClick={onClick}
            >
              <span className="font-semibold mr-2">
                {post.user?.displayName || post.profiles?.display_name || post.user?.username || 'Unknown'}
              </span>
              {post.content}
            </p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
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
        )}

        {/* View comments */}
        {(post.commentCount ?? post.comment_count ?? 0) > 0 && (
          <button 
            onClick={onComment}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors mb-2 block"
          >
            View all {(post.commentCount ?? post.comment_count)} comments
          </button>
        )}

        <p className="text-xs text-gray-400 uppercase tracking-wide">
          {formatDistanceToNow(new Date(post.createdAt || post.created_at), { addSuffix: true })}
        </p>
      </div>
    </motion.article>
  )
}

export default PostCard