import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronLeft, FiChevronRight, FiPlay } from 'react-icons/fi'

function MediaCarousel({ media, currentIndex, onIndexChange, onClick }) {
  const [isPlaying, setIsPlaying] = useState(false)

  const nextMedia = () => {
    if (currentIndex < media.length - 1) {
      onIndexChange(currentIndex + 1)
    }
  }

  const prevMedia = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1)
    }
  }

  const currentMedia = media[currentIndex]

  if (!media || media.length === 0 || !currentMedia) {
    return null // or you can return a fallback UI here
  }

  return (
    <div className="relative aspect-square bg-gray-100 overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
          onClick={onClick}
        >
          {currentMedia.type === 'image' ? (
            <img
              src={currentMedia.url}
              alt="Post media"
              className="w-full h-full object-cover cursor-pointer"
            />
          ) : (
            <div className="relative w-full h-full">
              <video
                src={currentMedia.url}
                poster={currentMedia.thumbnail}
                className="w-full h-full object-cover"
                controls={isPlaying}
                onClick={() => setIsPlaying(!isPlaying)}
              />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-white/90 p-4 rounded-full shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsPlaying(true)
                    }}
                  >
                    <FiPlay className="text-2xl text-gray-900 ml-1" />
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {media.length > 1 && (
        <>
          {currentIndex > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                prevMedia()
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiChevronLeft className="text-xl" />
            </motion.button>
          )}
          
          {currentIndex < media.length - 1 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                nextMedia()
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiChevronRight className="text-xl" />
            </motion.button>
          )}
        </>
      )}

      {/* Dots Indicator */}
      {media.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                onIndexChange(index)
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MediaCarousel