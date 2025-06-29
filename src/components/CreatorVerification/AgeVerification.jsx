import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiShield, FiCheck } from 'react-icons/fi'

function AgeVerification({ onComplete, loading }) {
  const [isConfirmed, setIsConfirmed] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isConfirmed) {
      onComplete()
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiShield className="text-2xl text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Age Verification
        </h2>
        <p className="text-gray-600">
          Confirm that you meet our age requirements
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Legal Notice */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            Age Requirements
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              To become a creator on our platform, you must be at least 18 years old.
            </p>
            <p>
              By confirming below, you certify that:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You are 18 years of age or older</li>
              <li>You have the legal capacity to enter into agreements</li>
              <li>All information provided is accurate and truthful</li>
            </ul>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="space-y-4">
          <motion.label
            whileTap={{ scale: 0.98 }}
            className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
              isConfirmed 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="relative">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                isConfirmed 
                  ? 'border-primary-500 bg-primary-500' 
                  : 'border-gray-300'
              }`}>
                {isConfirmed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiCheck className="text-white text-sm" />
                  </motion.div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                I confirm that I am 18 years of age or older
              </p>
              <p className="text-xs text-gray-600 mt-1">
                This confirmation is required to proceed with creator verification
              </p>
            </div>
          </motion.label>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!isConfirmed || loading}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            'Confirm and Continue'
          )}
        </motion.button>

        {!isConfirmed && (
          <p className="text-center text-sm text-gray-500">
            Please confirm your age to continue
          </p>
        )}
      </form>
    </div>
  )
}

export default AgeVerification