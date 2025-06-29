import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import ResetPasswordForm from './ResetPasswordForm'

function AuthModal({ isOpen, onClose, initialMode = 'signin' }) {
  const [currentMode, setCurrentMode] = useState(initialMode)

  const handleClose = () => {
    setCurrentMode('signin')
    onClose()
  }

  const renderForm = () => {
    switch (currentMode) {
      case 'signup':
        return <SignUpForm onSwitchMode={setCurrentMode} onClose={handleClose} />
      case 'forgot':
        return <ForgotPasswordForm onSwitchMode={setCurrentMode} onClose={handleClose} />
      case 'reset':
        return <ResetPasswordForm onSwitchMode={setCurrentMode} onClose={handleClose} />
      default:
        return <SignInForm onSwitchMode={setCurrentMode} onClose={handleClose} />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={handleClose}
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
              <div className="text-2xl font-bold gradient-text">
                CreatorSpace
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl text-gray-600" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMode}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderForm()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AuthModal