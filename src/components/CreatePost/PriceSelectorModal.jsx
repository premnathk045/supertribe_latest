import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiDollarSign, FiPercent, FiVideo, FiUpload } from 'react-icons/fi'

const PRICE_PRESETS = [2.99, 4.99, 9.99, 14.99, 19.99, 24.99]

function PriceSelectorModal({ isOpen, onClose, price, onPriceChange, subscriberDiscount, onDiscountChange, previewVideo, onPreviewVideoChange }) {
  const [customPrice, setCustomPrice] = useState(price?.toString() || '')
  const [customDiscount, setCustomDiscount] = useState(subscriberDiscount?.toString() || '')
  const [errors, setErrors] = useState({})

  const handlePriceSelect = (selectedPrice) => {
    setCustomPrice(selectedPrice.toString())
    onPriceChange(selectedPrice)
    setErrors(prev => ({ ...prev, price: '' }))
  }

  const handleCustomPriceChange = (value) => {
    setCustomPrice(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0.99 && numValue <= 999.99) {
      onPriceChange(numValue)
      setErrors(prev => ({ ...prev, price: '' }))
    } else if (value === '') {
      onPriceChange(0)
    }
  }

  const handleDiscountChange = (value) => {
    setCustomDiscount(value)
    const numValue = parseInt(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      onDiscountChange(numValue)
      setErrors(prev => ({ ...prev, discount: '' }))
    } else if (value === '') {
      onDiscountChange(0)
    }
  }

  const handlePreviewVideoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type.startsWith('video/')) {
        if (file.size <= 50 * 1024 * 1024) { // 50MB limit
          const preview = URL.createObjectURL(file)
          onPreviewVideoChange({ file, preview })
          setErrors(prev => ({ ...prev, previewVideo: '' }))
        } else {
          setErrors(prev => ({ ...prev, previewVideo: 'Video must be under 50MB' }))
        }
      } else {
        setErrors(prev => ({ ...prev, previewVideo: 'Please select a video file' }))
      }
    }
  }

  const handleRemovePreviewVideo = () => {
    if (previewVideo?.preview) {
      URL.revokeObjectURL(previewVideo.preview)
    }
    onPreviewVideoChange(null)
  }

  const validateAndClose = () => {
    const newErrors = {}

    if (!price || price < 0.99) {
      newErrors.price = 'Price must be at least $0.99'
    } else if (price > 999.99) {
      newErrors.price = 'Price cannot exceed $999.99'
    }

    if (subscriberDiscount && (subscriberDiscount < 0 || subscriberDiscount > 50)) {
      newErrors.discount = 'Discount must be between 0-50%'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onClose()
  }

  const finalPrice = price && subscriberDiscount 
    ? price * (1 - subscriberDiscount / 100) 
    : price

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Set Price</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Price Presets */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Select</h3>
              <div className="grid grid-cols-3 gap-3">
                {PRICE_PRESETS.map((preset) => (
                  <motion.button
                    key={preset}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePriceSelect(preset)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      price === preset
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <FiDollarSign className="text-sm" />
                      <span className="font-semibold">{preset}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom Price */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Price
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => handleCustomPriceChange(e.target.value)}
                  placeholder="0.00"
                  min="0.99"
                  max="999.99"
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.price && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.price}
                </motion.p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Minimum $0.99, Maximum $999.99
              </p>
            </div>

            {/* Subscriber Discount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscriber Discount (Optional)
              </label>
              <div className="relative">
                <FiPercent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={customDiscount}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="50"
                  className={`w-full pl-4 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.discount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.discount && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.discount}
                </motion.p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                0-50% discount for your subscribers
              </p>
            </div>

            {/* Price Summary */}
            {price > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-900 mb-2">Price Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Regular Price:</span>
                    <span className="font-medium">${price.toFixed(2)}</span>
                  </div>
                  {subscriberDiscount > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subscriber Discount:</span>
                        <span className="text-green-600">-{subscriberDiscount}%</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-900">Subscriber Price:</span>
                        <span className="text-green-600">${finalPrice.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Preview Video */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview Video (Optional)
              </label>
              
              {previewVideo ? (
                <div className="relative">
                  <video
                    src={previewVideo.preview}
                    controls
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRemovePreviewVideo}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
                  >
                    <FiX className="text-sm" />
                  </motion.button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handlePreviewVideoUpload}
                    className="hidden"
                    id="preview-video-upload"
                  />
                  <label
                    htmlFor="preview-video-upload"
                    className="w-full border-2 border-dashed border-gray-300 hover:border-primary-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors"
                  >
                    <FiVideo className="text-3xl text-gray-400 mb-2" />
                    <p className="text-gray-600 font-medium">Upload Preview Video</p>
                    <p className="text-sm text-gray-500">Max 50MB, MP4/WebM</p>
                  </label>
                </div>
              )}
              
              {errors.previewVideo && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.previewVideo}
                </motion.p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Short preview to entice buyers
              </p>
            </div>

            {/* Footer */}
            <div className="flex space-x-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={validateAndClose}
                disabled={!price || price < 0.99}
                className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Set Price
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PriceSelectorModal