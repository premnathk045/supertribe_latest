import { motion } from 'framer-motion'

function UploadProgressBar({ progress, size = 'md', showPercentage = false, className = '' }) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}>
      <motion.div
        className="h-full bg-primary-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
      {showPercentage && (
        <div className="text-center mt-1">
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  )
}

export default UploadProgressBar