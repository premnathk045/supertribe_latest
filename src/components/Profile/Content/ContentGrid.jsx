import { motion } from 'framer-motion'
import ContentItem from './ContentItem'

function ContentGrid({ activeTab, posts, loading, error, onPostClick }) {
  const [userPosts, savedPosts, likedPosts] = posts
  
  // Select posts based on active tab
  const getContent = () => {
    switch (activeTab) {
      case 'saved':
        return savedPosts
      case 'liked':
        return likedPosts
      case 'posts':
      default:
        return userPosts
    }
  }
  
  const currentPosts = getContent()
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, index) => (
          <div 
            key={index}
            className="aspect-square bg-gray-200 animate-pulse rounded-lg"
          ></div>
        ))}
      </div>
    )
  }
  
  if (!currentPosts || currentPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">
          {activeTab === 'posts' ? '📝' : activeTab === 'saved' ? '🔖' : '❤️'}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No {activeTab} yet
        </h3>
        <p className="text-gray-600">
          {activeTab === 'posts' 
            ? 'Posts will appear here when they\'re created'
            : activeTab === 'saved' 
            ? 'Saved posts will appear here'
            : 'Liked posts will appear here'
          }
        </p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-3 gap-1">
      {currentPosts.map((post, index) => (
        <ContentItem 
          key={post.id} 
          post={post} 
          index={index}
          onClick={() => onPostClick && onPostClick(post)}
        />
      ))}
    </div>
  )
}

export default ContentGrid