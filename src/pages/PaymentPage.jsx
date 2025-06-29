import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCreditCard, FiCheck, FiShield } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import usePaymentMethods from '../hooks/usePaymentMethods'
import LoadingSpinner from '../components/UI/LoadingSpinner'

function PaymentPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addDemoPaymentMethod, loading, error } = usePaymentMethods()
  
  const [formData, setFormData] = useState({
    cardNumber: '4532 1234 5678 1234',
    expiryDate: '12/25',
    cvv: '123',
    cardholderName: 'John Doe'
  })
  const [isAgreed, setIsAgreed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isAgreed) {
      setSaving(true)
      try {
        const result = await addDemoPaymentMethod(formData)
        if (result) {
          setSuccess(true)
          setTimeout(() => {
            navigate(-1)
          }, 2000)
        }
      } catch (err) {
        console.error('Error adding payment method:', err)
      } finally {
        setSaving(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          
          <h1 className="text-lg font-semibold">Payment Method</h1>
          
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6">
        {loading && !success ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : success ? (
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FiCheck className="text-3xl text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Payment Method Added
            </h2>
            <p className="text-gray-600 mb-6">
              Your payment method has been successfully added.
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Continue
            </motion.button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCreditCard className="text-2xl text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Add Payment Method
              </h2>
              <p className="text-gray-600">
                Add a payment method to purchase premium content
              </p>
            </div>

            {/* Demo Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <FiShield className="text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Demo Mode</h3>
                  <p className="text-sm text-blue-700">
                    This is a demonstration. No real payment information is required or processed.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Demo Card Display */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-sm opacity-80">Demo Card</p>
                    <p className="text-lg font-semibold">CreatorSpace</p>
                  </div>
                  <div className="text-right">
                    <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-mono tracking-wider">
                      **** **** **** 1234
                    </p>
                  </div>
                  
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs opacity-80">CARDHOLDER</p>
                      <p className="font-semibold">DEMO USER</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-80">EXPIRES</p>
                      <p className="font-semibold">12/25</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demo Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={formData.expiryDate}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={formData.cvv}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={formData.cardholderName}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="space-y-4">
                <motion.label
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isAgreed 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      isAgreed 
                        ? 'border-primary-500 bg-primary-500' 
                        : 'border-gray-300'
                    }`}>
                      {isAgreed && (
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
                      I agree to the payment terms and conditions
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      This demo setup will enable premium content purchases
                    </p>
                  </div>
                </motion.label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={!isAgreed || saving}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                {saving ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  'Add Payment Method'
                )}
              </motion.button>

              {!isAgreed && (
                <p className="text-center text-sm text-gray-500">
                  Please agree to the terms to continue
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentPage