import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi'

function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [duration])

  useEffect(() => {
    if (!isVisible && onClose) {
      // Small delay to allow exit animation to complete
      const timer = setTimeout(() => {
        onClose()
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheck className="text-white" />
      case 'error':
        return <FiAlertCircle className="text-white" />
      case 'info':
        return <FiInfo className="text-white" />
      default:
        return <FiInfo className="text-white" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'info':
        return 'bg-blue-500'
      default:
        return 'bg-gray-800'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg ${getBackgroundColor()}`}>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              {getIcon()}
            </div>
            <p className="text-white font-medium">{message}</p>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <FiX className="text-white" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast