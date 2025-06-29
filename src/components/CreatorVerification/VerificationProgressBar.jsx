import { motion } from 'framer-motion'
import { FiCheck } from 'react-icons/fi'

const steps = [
  { id: 1, title: 'Personal Info', description: 'Basic information' },
  { id: 2, title: 'Age Verification', description: 'Confirm eligibility' },
  { id: 3, title: 'Profile Setup', description: 'Complete your profile' },
  { id: 4, title: 'Payment Setup', description: 'Add payment method' }
]

function VerificationProgressBar({ currentStep, totalSteps }) {
  return (
    <div className="w-full">
      {/* Progress Line */}
      <div className="relative">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200"></div>
        <motion.div
          className="absolute top-5 left-0 h-0.5 bg-primary-500"
          initial={{ width: '0%' }}
          animate={{ 
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` 
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        ></motion.div>
        
        {/* Step Circles */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = step.id < currentStep
            const isCurrent = step.id === currentStep
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                    isCompleted
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : isCurrent
                      ? 'bg-white border-primary-500 text-primary-500'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? (
                    <FiCheck className="text-lg" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </motion.div>
                
                <div className="mt-3 text-center">
                  <p className={`text-sm font-medium ${
                    isCurrent ? 'text-primary-600' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default VerificationProgressBar