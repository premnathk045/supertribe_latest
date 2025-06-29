import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCopy, FiMessageCircle, FiMail, FiInstagram, FiTwitter, FiLinkedin } from 'react-icons/fi'

const shareOptions = [
  { icon: FiCopy, title: 'Copy Link', description: 'Copy link to clipboard' },
  { icon: FiMessageCircle, title: 'Direct Message', description: 'Send via message' },
  { icon: FiMail, title: 'Email', description: 'Share via email' },
  { icon: FiInstagram, title: 'Instagram', description: 'Share to Instagram' },
  { icon: FiTwitter, title: 'Twitter', description: 'Share to Twitter' },
  { icon: FiLinkedin, title: 'LinkedIn', description: 'Share to LinkedIn' }
]

function ShareSheetModal({ isOpen, onClose }) {
  const handleShare = (option) => {
    console.log('Sharing via:', option.title)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-white rounded-t-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Share Post</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              {shareOptions.map((option, index) => (
                <motion.button
                  key={option.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleShare(option)}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white rounded-lg">
                      <option.icon className="text-xl text-primary-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{option.title}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ShareSheetModal