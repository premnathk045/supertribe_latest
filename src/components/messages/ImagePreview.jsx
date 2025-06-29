import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiDownload, FiZoomIn, FiZoomOut } from 'react-icons/fi'

function ImagePreview({ isOpen, imageUrl, onClose }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [scale, setScale] = useState(1)
  
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setError(false)
      setScale(1)
      
      // Prevent body scrolling while modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, imageUrl])
  
  const handleImageLoad = () => {
    setIsLoading(false)
  }
  
  const handleImageError = () => {
    setIsLoading(false)
    setError(true)
  }
  
  const handleZoomIn = () => {
    setScale(scale => Math.min(scale + 0.5, 3))
  }
  
  const handleZoomOut = () => {
    setScale(scale => Math.max(scale - 0.5, 0.5))
  }
  
  const handleDownload = () => {
    if (!imageUrl) return
    
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = imageUrl.split('/').pop() || 'image'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div 
            className="absolute top-4 right-4 z-10 flex space-x-2"
            onClick={e => e.stopPropagation()}
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomIn}
              className="p-2 bg-black/50 text-white rounded-full"
            >
              <FiZoomIn />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomOut}
              className="p-2 bg-black/50 text-white rounded-full"
            >
              <FiZoomOut />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleDownload}
              className="p-2 bg-black/50 text-white rounded-full"
            >
              <FiDownload />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 bg-black/50 text-white rounded-full"
            >
              <FiX />
            </motion.button>
          </div>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {error && (
            <div className="text-center text-white">
              <p className="mb-2">Failed to load image</p>
              <button 
                className="text-primary-300 underline"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsLoading(true)
                  setError(false)
                  // Force reload the image
                  const img = new Image()
                  img.src = imageUrl + '?t=' + new Date().getTime()
                }}
              >
                Try Again
              </button>
            </div>
          )}
          
          <motion.div
            animate={{ scale }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ maxWidth: '90vw', maxHeight: '80vh' }}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl}
              alt="Full size preview"
              className="max-w-full max-h-[80vh] object-contain"
              style={{ display: isLoading || error ? 'none' : 'block' }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ImagePreview