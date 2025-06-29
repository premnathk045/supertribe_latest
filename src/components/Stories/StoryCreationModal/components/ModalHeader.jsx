import { motion } from 'framer-motion'
import { FiX, FiArrowLeft } from 'react-icons/fi'

function ModalHeader({ onClose, isPreviewMode, currentMode }) {
  const getTitle = () => {
    if (isPreviewMode) return 'Preview'
    
    switch (currentMode) {
      case 'photo': return 'Photo'
      case 'video': return 'Video'
      case 'text': return 'Text'
      case 'gallery': return 'Gallery'
      default: return 'Story'
    }
  }

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent"
    >
      <div className="flex items-center justify-between px-4 pt-12 pb-6">
        {/* Left Side */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
        >
          {isPreviewMode ? (
            <FiArrowLeft className="text-white text-xl" />
          ) : (
            <FiX className="text-white text-xl" />
          )}
        </motion.button>

        {/* Center Title */}
        <motion.div
          key={getTitle()}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-white font-semibold text-lg"
        >
          {getTitle()}
        </motion.div>

        {/* Right Side - User Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
          <img
            src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40"
            alt="Your avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </motion.div>
  )
}

export default ModalHeader