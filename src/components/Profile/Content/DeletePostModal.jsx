import { motion, AnimatePresence } from 'framer-motion'
import { FiTrash2, FiAlertTriangle } from 'react-icons/fi'

function DeletePostModal({ isOpen, onClose, onConfirm, isDeleting }) {
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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <FiAlertTriangle className="text-3xl text-red-500" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete Post?
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                This action cannot be undone. The post will be permanently deleted.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  {isDeleting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <FiTrash2 className="text-sm" />
                      <span>Delete Post</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-800 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default DeletePostModal