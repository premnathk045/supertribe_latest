import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSettings, FiLogOut, FiShield, FiEdit } from 'react-icons/fi'

function SettingsMenu({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
      >
        <FiSettings className="text-lg text-gray-700" />
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 z-40 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="py-1">
                <button
                  className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <FiEdit className="text-gray-500" />
                  <span className="text-gray-700">Edit Profile</span>
                </button>
                
                <button
                  className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <FiShield className="text-gray-500" />
                  <span className="text-gray-700">Privacy Settings</span>
                </button>
                
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-red-50 transition-colors border-t border-gray-100"
                >
                  <FiLogOut className="text-red-500" />
                  <span className="text-red-500">Log Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SettingsMenu