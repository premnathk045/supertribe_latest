import { useRef } from 'react'
import { motion } from 'framer-motion'
import { FiPlus } from 'react-icons/fi'
import { useStories } from '../../hooks/useStories'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../UI/LoadingSpinner'

function StoriesCarousel({ onStoryClick, onCreateStory }) {
  const scrollRef = useRef(null)
  const { storiesForCarousel, loading, error, getUserStories } = useStories()
  const { user, isCreator } = useAuth()

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 100
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (loading) {
    return (
      <div className="py-4">
        <div className="max-w-lg mx-auto px-4 flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4">
        <div className="max-w-lg mx-auto px-4 text-center">
          <p className="text-red-500 text-sm">Failed to load stories</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="max-w-lg mx-auto px-4">
        <div 
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide"
        >
          {/* Add Story Button - Only for creators */}
          {user && isCreator() && onCreateStory && (
            <motion.div
              whileTap={{ scale: 0.95 }}
              onClick={onCreateStory}
              className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer"
            >
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors">
                <FiPlus className="text-gray-500 text-xl" />
              </div>
              <span className="text-xs text-gray-600 font-medium">Your Story</span>
            </motion.div>
          )}

          {/* Stories */}
          {storiesForCarousel.map((story) => {
            const profile = story.profiles
            const isViewed = story.isViewed || false
            const userId = profile?.id || story.creator_id
            const userStories = getUserStories(userId)

            return (
              <motion.div
                key={userId}
                whileTap={{ scale: 0.95 }}
                onClick={() => onStoryClick({ userId, stories: userStories })}
                className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer"
              >
                <div className={`story-ring ${isViewed ? 'opacity-50' : ''}`}>
                  <div className="story-inner">
                    {story.content_type === 'text' ? (
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ 
                          background: story.background_style?.type === 'gradient' 
                            ? story.background_style.value 
                            : story.background_style?.value || '#000000'
                        }}
                      >
                        {story.text_content?.substring(0, 2) || 'T'}
                      </div>
                    ) : (
                      <img
                        src={story.thumbnail_url || story.media_url || profile?.avatar_url}
                        alt={profile?.display_name || 'Story'}
                        className="w-14 h-14 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = profile?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
                        }}
                      />
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-700 font-medium truncate w-16 text-center">
                  {profile?.username || 'Unknown'}
                </span>
              </motion.div>
            )
          })}

          {/* Empty state */}
          {storiesForCarousel.length === 0 && (
            <div className="flex-1 text-center py-8">
              <p className="text-gray-500 text-sm">No stories available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StoriesCarousel