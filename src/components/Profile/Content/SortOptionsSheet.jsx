import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheck } from 'react-icons/fi'

function SortOptionsSheet({ isOpen, onClose, options, selectedOption, onSelect }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-full max-w-md bg-white rounded-t-xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sort By</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-2 mb-4">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onSelect(option)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className={`font-medium ${selectedOption.id === option.id ? 'text-primary-500' : 'text-gray-700'}`}>
                    {option.label}
                  </span>
                  {selectedOption.id === option.id && (
                    <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                      <FiCheck className="text-white text-sm" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SortOptionsSheet