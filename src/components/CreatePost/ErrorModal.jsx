import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'

function ErrorModal({ isOpen, onClose, error, onRetry, retryLabel = 'Try Again' }) {
  const getErrorIcon = () => {
    return <FiAlertCircle className="text-4xl text-red-500" />
  }

  const getErrorTitle = () => {
    if (error?.type === 'upload') return 'Upload Failed'
    if (error?.type === 'network') return 'Connection Error'
    if (error?.type === 'validation') return 'Validation Error'
    if (error?.type === 'permission') return 'Permission Error'
    return 'Something Went Wrong'
  }

  const getErrorMessage = () => {
    if (error?.message) return error.message
    return 'An unexpected error occurred. Please try again.'
  }

  const getErrorDetails = () => {
    if (error?.details) return error.details
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {getErrorTitle()}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                {getErrorIcon()}
                <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                  {getErrorTitle()}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {getErrorMessage()}
                </p>
              </div>

              {/* Error Details */}
              {getErrorDetails() && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Details:</h4>
                  <p className="text-sm text-gray-600 font-mono">
                    {getErrorDetails()}
                  </p>
                </div>
              )}

              {/* Troubleshooting Tips */}
              {error?.type === 'upload' && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Troubleshooting:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Check your internet connection</li>
                    <li>• Ensure file size is under the limit</li>
                    <li>• Try uploading a different file</li>
                    <li>• Refresh the page and try again</li>
                  </ul>
                </div>
              )}

              {error?.type === 'network' && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Troubleshooting:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Check your internet connection</li>
                    <li>• Try refreshing the page</li>
                    <li>• Wait a moment and try again</li>
                  </ul>
                </div>
              )}

              {error?.type === 'validation' && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Please check:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• All required fields are filled</li>
                    <li>• File formats are supported</li>
                    <li>• Content meets our guidelines</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-xl font-medium transition-colors"
                >
                  Close
                </motion.button>
                
                {onRetry && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onRetry}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <FiRefreshCw className="text-lg" />
                    <span>{retryLabel}</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ErrorModal