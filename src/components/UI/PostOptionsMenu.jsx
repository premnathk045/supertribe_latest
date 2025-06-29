import { motion, AnimatePresence } from 'framer-motion'
import { FiMoreHorizontal, FiTrash2, FiEdit, FiShare, FiFlag } from 'react-icons/fi'

function PostOptionsMenu({ isOpen, onClose, onOpen, onDelete, onEdit, onShare, onReport, isCreator }) {
  return (
    <div className="relative">
      <button
        onClick={isOpen ? onClose : onOpen}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <FiMoreHorizontal className="text-gray-600" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={onClose}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 z-50 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
              {isCreator && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
                      onClose()
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-red-50 transition-colors text-red-600"
                  >
                    <FiTrash2 className="text-lg" />
                    <span>Delete Post</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                      onClose()
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <FiEdit className="text-gray-600 text-lg" />
                    <span>Edit Post</span>
                  </button>
                </>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onShare()
                  onClose()
                }}
                className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <FiShare className="text-gray-600 text-lg" />
                <span>Share Post</span>
              </button>
              
              {!isCreator && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onReport()
                    onClose()
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <FiFlag className="text-gray-600 text-lg" />
                  <span>Report Post</span>
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PostOptionsMenu