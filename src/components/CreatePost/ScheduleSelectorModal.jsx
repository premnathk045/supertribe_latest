import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCalendar, FiClock } from 'react-icons/fi'
import { format, addDays, addHours, isAfter } from 'date-fns'

const QUICK_SCHEDULE_OPTIONS = [
  { label: 'In 1 hour', getValue: () => addHours(new Date(), 1) },
  { label: 'In 3 hours', getValue: () => addHours(new Date(), 3) },
  { label: 'Tomorrow 9 AM', getValue: () => {
    const tomorrow = addDays(new Date(), 1)
    tomorrow.setHours(9, 0, 0, 0)
    return tomorrow
  }},
  { label: 'Tomorrow 6 PM', getValue: () => {
    const tomorrow = addDays(new Date(), 1)
    tomorrow.setHours(18, 0, 0, 0)
    return tomorrow
  }},
  { label: 'Next week', getValue: () => addDays(new Date(), 7) }
]

function ScheduleSelectorModal({ isOpen, onClose, scheduledFor, onScheduleChange }) {
  const [selectedDate, setSelectedDate] = useState(
    scheduledFor ? format(scheduledFor, 'yyyy-MM-dd') : ''
  )
  const [selectedTime, setSelectedTime] = useState(
    scheduledFor ? format(scheduledFor, 'HH:mm') : '09:00'
  )
  const [error, setError] = useState('')

  const handleQuickSelect = (option) => {
    const dateTime = option.getValue()
    setSelectedDate(format(dateTime, 'yyyy-MM-dd'))
    setSelectedTime(format(dateTime, 'HH:mm'))
    setError('')
  }

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time')
      return
    }

    const dateTime = new Date(`${selectedDate}T${selectedTime}`)
    const now = new Date()

    if (!isAfter(dateTime, now)) {
      setError('Scheduled time must be in the future')
      return
    }

    // Check if it's more than 1 year in the future
    const oneYearFromNow = addDays(now, 365)
    if (isAfter(dateTime, oneYearFromNow)) {
      setError('Cannot schedule more than 1 year in advance')
      return
    }

    onScheduleChange(dateTime)
    onClose()
  }

  const handleRemoveSchedule = () => {
    onScheduleChange(null)
    onClose()
  }

  // Get minimum date (today)
  const minDate = format(new Date(), 'yyyy-MM-dd')
  
  // Get minimum time if selected date is today
  const isToday = selectedDate === minDate
  const minTime = isToday ? format(addHours(new Date(), 1), 'HH:mm') : '00:00'

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
              <h2 className="text-xl font-bold text-gray-900">Schedule Post</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Current Schedule */}
            {scheduledFor && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Currently Scheduled</p>
                    <p className="text-blue-700">
                      {format(scheduledFor, 'MMM dd, yyyy \'at\' h:mm a')}
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRemoveSchedule}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Remove
                  </motion.button>
                </div>
              </div>
            )}

            {/* Quick Options */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Schedule</h3>
              <div className="space-y-2">
                {QUICK_SCHEDULE_OPTIONS.map((option, index) => (
                  <motion.button
                    key={index}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickSelect(option)}
                    className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{option.label}</span>
                      <span className="text-sm text-gray-500">
                        {format(option.getValue(), 'MMM dd, h:mm a')}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom Date & Time */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Custom Schedule</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Date Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value)
                        setError('')
                      }}
                      min={minDate}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Time Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <div className="relative">
                    <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => {
                        setSelectedTime(e.target.value)
                        setError('')
                      }}
                      min={isToday ? minTime : '00:00'}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {error}
                </motion.p>
              )}

              {selectedDate && selectedTime && !error && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Will be published:</strong>{' '}
                    {format(new Date(`${selectedDate}T${selectedTime}`), 'EEEE, MMM dd, yyyy \'at\' h:mm a')}
                  </p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-2">Scheduling Info</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Posts can be scheduled up to 1 year in advance</li>
                <li>• Scheduled posts will appear in your drafts</li>
                <li>• You can edit or cancel scheduled posts anytime</li>
                <li>• Times are based on your local timezone</li>
              </ul>
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
                onClick={handleConfirm}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Schedule Post
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ScheduleSelectorModal