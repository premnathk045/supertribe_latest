import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiChevronLeft, FiChevronRight, FiVolume2, FiVolumeX } from 'react-icons/fi'
import { useStories } from '../../hooks/useStories'
import { formatDistanceToNow } from 'date-fns'
import VerifiedBadge from '../VerifiedBadge'

function StoryViewerModal({ isOpen, story, onClose }) {
  // story: { userId, stories }
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const isMounted = useRef(false)
  const videoRef = useRef(null)
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
    setIsPaused(false)
    closeRequested.current = false
  }, [isOpen, story])

  useEffect(() => {
    if (!isOpen) return

    // Reset progress when changing stories
    setProgress(0)

    // Handle video playback for video stories
    if (currentStory?.content_type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.muted = isMuted
      if (!isPaused) {
        // Force autoplay with a small delay to ensure proper loading
        setTimeout(() => {
          videoRef.current?.play().catch(err => {
            console.error('Failed to play video:', err)
          })
        }, 100)
      }
      return;
    }

    // For non-video stories, use timer for progress
    let timer;
    if (!isPaused) {
      timer = setInterval(() => {
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
    }

    return () => clearInterval(timer)
  }, [isOpen, currentStoryIndex, userStories, isPaused, isMuted])

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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }

  const handleTouchStart = () => {
    setIsPaused(true);
    if (videoRef.current && videoRef.current.pause) {
      videoRef.current.pause();
    }
  }

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (videoRef.current && videoRef.current.play) {
      videoRef.current.play().catch(err => {
        console.error('Failed to resume video:', err)
      });
    }
  }

  const getStoryContent = (story) => {
    if (story.content_type === 'text') {
      return (
        <div 
          className="absolute inset-0 w-full h-full flex items-center justify-center p-8"
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
    } else if (story.file_type && story.file_type.startsWith('video/') || 
               story.content_type === 'video') {
      // Render video with Instagram-like behavior
      return (
        <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
          <video
            ref={videoRef}
            src={story.media_url}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              // Ensure video fills viewport and maintains aspect ratio
              minWidth: '100%',
              minHeight: '100%',
              width: 'auto',
              height: 'auto',
              // Hide any browser default controls completely
              WebkitAppearance: 'none',
              // Remove any outline or focus styles
              outline: 'none',
              border: 'none'
            }}
            autoPlay={true}
            playsInline={true}
            controls={false}
            muted={isMuted}
            loop={false}
            preload="auto"
            // Hide timeline and all controls
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture={true}
            onTimeUpdate={(e) => {
              if (e.target.duration) {
                const percentage = (e.target.currentTime / e.target.duration) * 100;
                setProgress(percentage);
              }
            }}
            onEnded={goToNext}
            onError={(e) => {
              console.error('Failed to load story media:', story.media_url, e)
            }}
            onLoadedData={() => {
              // Ensure video starts playing immediately after loading
              if (videoRef.current && !isPaused) {
                videoRef.current.play().catch(err => {
                  console.error('Failed to autoplay video:', err)
                })
              }
            }}
            onCanPlay={() => {
              // Additional autoplay trigger
              if (videoRef.current && !isPaused) {
                videoRef.current.play().catch(err => {
                  console.error('Failed to play video on canPlay:', err)
                })
              }
            }}
          />
          
          {/* Mute/Unmute Button - positioned like Instagram */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:bg-black/70"
          >
            {isMuted ? 
              <FiVolumeX className="text-white text-lg" /> : 
              <FiVolume2 className="text-white text-lg" />
            }
          </button>
        </div>
      )
    } else {
      // Render image with Instagram-like behavior
      return (
        <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
          <img
            src={story.media_url}
            alt="Story"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              // Ensure image fills viewport and maintains aspect ratio
              minWidth: '100%',
              minHeight: '100%',
              width: 'auto',
              height: 'auto'
            }}
            onError={(e) => {
              console.error('Failed to load story media:', story.media_url)
              e.target.src = story.profiles?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'
            }}
          />
        </div>
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
          style={{ height: '100vh', width: '100vw' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative w-full h-full max-w-sm bg-black"
            style={{ 
              height: '100vh',
              maxHeight: '100vh',
              // Ensure full viewport coverage on mobile
              WebkitOverflowScrolling: 'touch'
            }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
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
            <div className="absolute inset-0 w-full h-full">
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
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
            />
            <button
              className="absolute right-0 top-0 w-1/3 h-full z-10"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            />

            {/* Navigation Buttons */}
            {currentStoryIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full"
              >
                <FiChevronLeft className="text-xl" />
              </button>
            )}
            
            {currentStoryIndex < userStories.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
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