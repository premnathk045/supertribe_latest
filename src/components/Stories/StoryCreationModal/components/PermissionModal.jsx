import { motion, AnimatePresence } from 'framer-motion'
import { FiCamera, FiMic, FiImage, FiSettings } from 'react-icons/fi'

const permissionConfig = {
  camera: {
    icon: FiCamera,
    title: 'Camera Access Required',
    description: 'To take photos and videos for your story, please allow camera access.',
    settingsText: 'Enable camera access in your browser settings to continue.'
  },
  microphone: {
    icon: FiMic,
    title: 'Microphone Access Required',
    description: 'To record videos with audio for your story, please allow microphone access.',
    settingsText: 'Enable microphone access in your browser settings to continue.'
  },
  photos: {
    icon: FiImage,
    title: 'Photo Library Access Required',
    description: 'To select photos and videos from your library, please allow access.',
    settingsText: 'Enable photo library access in your browser settings to continue.'
  }
}

function PermissionModal({ isOpen, type, onClose, onRetry }) {
  if (!type || !permissionConfig[type]) return null

  const config = permissionConfig[type]
  const Icon = config.icon

  const handleOpenSettings = () => {
    // In a real app, this would open system settings
    // For web, we can only provide instructions
    alert('Please check your browser settings to enable the required permissions.')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full mx-4"
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <Icon className="text-white text-2xl" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-white text-lg font-semibold mb-2">
                {config.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {config.description}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onRetry}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-colors"
              >
                Try Again
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenSettings}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <FiSettings className="text-lg" />
                <span>Open Settings</span>
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full text-gray-400 hover:text-white py-3 rounded-xl font-medium transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PermissionModal