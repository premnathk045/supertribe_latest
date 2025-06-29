import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useStories } from '../../hooks/useStories'
import { formatDistanceToNow } from 'date-fns'
import VerifiedBadge from '../VerifiedBadge'

function StoryViewerModal({ isOpen, story, onClose }) {
  // story: { userId, stories }
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const isMounted = useRef(false)
  const closeRequested = useRef(false)

  // Get the stories for the selected user
  const userStories = story?.stories || []
  const currentStory = userStories[currentStoryIndex]

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!isOpen || !userStories.length) return
    setCurrentStoryIndex(0)
    setProgress(0)
    closeRequested.current = false
  }, [isOpen, story])

  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Auto advance to next story
          if (currentStoryIndex < userStories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1)
            return 0
          } else {
            // Instead of calling onClose directly, set a flag
            closeRequested.current = true
            return 0
          }
        }
        return prev + 2 // 5 second duration (100 / 2 = 50 intervals)
      })
    }, 100)

    return () => clearInterval(timer)
  }, [isOpen, currentStoryIndex, userStories])

  // Effect to handle close after progress completes
  useEffect(() => {
    if (closeRequested.current && isMounted.current) {
      onClose()
      closeRequested.current = false
    }
  }, [progress, onClose])

  const goToPrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1)
      setProgress(0)
    }
  }

  const goToNext = () => {
    if (currentStoryIndex < userStories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1)
      setProgress(0)
    } else {
      // Instead of calling onClose directly, set a flag
      closeRequested.current = true
    }
  }

  const getStoryContent = (story) => {
    if (story.content_type === 'text') {
      return (
        <div 
          className="w-full h-full flex items-center justify-center p-8"
          style={{ 
            background: story.background_style?.type === 'gradient' 
              ? story.background_style.value 
              : story.background_style?.value || '#000000'
          }}
        >
          <div
            className="text-center max-w-md"
            style={{
              color: story.text_style?.color || '#ffffff',
              fontSize: `${story.text_style?.size || 24}px`,
              textAlign: story.text_style?.align || 'center',
              fontWeight: story.text_style?.bold ? 'bold' : 'normal',
              fontStyle: story.text_style?.italic ? 'italic' : 'normal',
              lineHeight: '1.2'
            }}
          >
            {story.text_content}
          </div>
        </div>
      )
    } else if (story.file_type && story.file_type.startsWith('video/')) {
      // Render video
      return (
        <video
          src={story.media_url}
          controls
          autoPlay
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Failed to load story media:', story.media_url)
          }}
        />
      )
    } else {
      // Render image
      return (
        <img
          src={story.media_url}
          alt="Story"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Failed to load story media:', story.media_url)
            e.target.src = story.profiles?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'
          }}
        />
      )
    }
  }

  if (!userStories || userStories.length === 0) {
    return null
  }
  return (
    <AnimatePresence>
      {isOpen && currentStory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative w-full max-w-sm h-full max-h-screen bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Bars */}
            <div className="absolute top-4 left-4 right-4 z-10 flex space-x-1">
              {userStories.map((_, index) => (
                <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-100"
                    style={{
                      width: index === currentStoryIndex 
                        ? `${progress}%` 
                        : index < currentStoryIndex 
                        ? '100%' 
                        : '0%'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={currentStory.profiles?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40'}
                  alt={currentStory.profiles?.display_name || 'User'}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    {currentStory.profiles?.display_name || currentStory.profiles?.username || 'Unknown'}
                  </h3>
                  {currentStory.profiles?.is_verified && (
                    <VerifiedBadge size="xs" className="ml-1" />
                  )}
                  <p className="text-white/70 text-xs">
                    {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX className="text-white text-xl" />
              </button>
            </div>

            {/* Story Content */}
            <div className="w-full h-full flex items-center justify-center">
              {getStoryContent(currentStory)}
            </div>

            {/* Caption Overlay */}
            {currentStory.caption && (
              <div className="absolute bottom-24 left-0 right-0 px-6 z-20 flex justify-center pointer-events-none">
                <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-center text-base max-w-xs mx-auto">
                  {currentStory.caption}
                </div>
              </div>
            )}

            {/* Navigation Areas */}
            <button
              className="absolute left-0 top-0 w-1/3 h-full z-10"
              onClick={goToPrevious}
            />
            <button
              className="absolute right-0 top-0 w-1/3 h-full z-10"
              onClick={goToNext}
            />

            {/* Navigation Buttons */}
            {currentStoryIndex > 0 && (
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full"
              >
                <FiChevronLeft className="text-xl" />
              </button>
            )}
            
            {currentStoryIndex < userStories.length - 1 && (
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full"
              >
                <FiChevronRight className="text-xl" />
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default StoryViewerModal