import { motion, AnimatePresence } from 'framer-motion'
import { FiCreditCard, FiX, FiAlertCircle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

function PaymentMethodModal({ isOpen, onClose }) {
  const navigate = useNavigate()

  const handleAddPaymentMethod = () => {
    onClose()
    navigate('/payment')
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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Payment Method Required</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <FiAlertCircle className="text-3xl text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Method Found</h3>
                <p className="text-gray-600">
                  You need to add a payment method to unlock premium content.
                </p>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddPaymentMethod}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <FiCreditCard className="text-lg" />
                  <span>Add Payment Method</span>
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PaymentMethodModal