import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

function ResponsiveWrapper({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (isMobile) {
    return children
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center"
      >
        <div className="w-24 h-24 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 2H7C5.89543 2 5 2.89543 5 4V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V4C19 2.89543 18.1046 2 17 2Z" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 18H12.01" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          SuperTribe is currently optimized for mobile devices
        </h1>
        
        <h2 className="text-lg text-primary-600 font-medium mb-6">
          Tablet and desktop versions coming soon!
        </h2>
        
        <p className="text-gray-600 mb-8">
          Please view on your mobile device or resize your browser window to mobile size.
        </p>
        
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <span>Recommended width:</span>
          <span className="px-2 py-1 bg-gray-100 rounded font-mono">≤ 600px</span>
        </div>
      </motion.div>
    </div>
  )
}

export default ResponsiveWrapper