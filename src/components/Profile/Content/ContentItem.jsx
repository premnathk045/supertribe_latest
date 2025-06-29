import { motion } from 'framer-motion'
import { FiHeart, FiMessageCircle } from 'react-icons/fi'

function ContentItem({ post, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer"
      onClick={() => onClick?.(post)}
    >
      {post.media_urls && post.media_urls.length > 0 ? (
        <img
          src={post.media_urls[0]}
          alt="Post"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">No Image</span>
        </div>
      )}
      
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="flex items-center space-x-4 text-white">
          <div className="flex items-center space-x-1">
            <FiHeart className="fill-current" />
            <span className="font-medium">{post.like_count || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FiMessageCircle />
            <span className="font-medium">{post.comment_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Premium indicator */}
      {post.is_premium && (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
          Premium
        </div>
      )}

      {/* Multiple media indicator */}
      {post.media_urls && post.media_urls.length > 1 && (
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          1/{post.media_urls.length}
        </div>
      )}
    </motion.div>
  )
}

export default ContentItem