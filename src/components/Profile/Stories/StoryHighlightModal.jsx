import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheck, FiArrowRight } from 'react-icons/fi'

function StoryHighlightModal({ 
  isOpen, 
  onClose, 
  stories, 
  currentHighlights,
  onSave,
  isLoading
}) {
  const [selectedStories, setSelectedStories] = useState([])
  const [highlightTitle, setHighlightTitle] = useState('')
  const [coverStory, setCoverStory] = useState(null)
  const [step, setStep] = useState(1) // 1 = select stories, 2 = customize
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedStories([])
      setHighlightTitle('')
      setCoverStory(null)
      setStep(1)
    }
  }, [isOpen])
  
  // Handle story selection
  const toggleStorySelection = (story) => {
    if (selectedStories.some(s => s.id === story.id)) {
      setSelectedStories(prev => prev.filter(s => s.id !== story.id))
    } else {
      // Maximum 5 stories allowed
      if (selectedStories.length < 5) {
        setSelectedStories(prev => [...prev, story])
      }
    }
  }
  
  // Go to next step
  const handleNext = () => {
    if (step === 1) {
      // If stories selected, go to next step and set first story as cover
      if (selectedStories.length > 0) {
        setStep(2)
        setCoverStory(selectedStories[0])
      }
    } else {
      // Save highlight
      handleSave()
    }
  }
  
  // Save highlight
  const handleSave = () => {
    onSave({
      title: highlightTitle || 'Highlight',
      stories: selectedStories.map(s => s.id),
      cover_id: coverStory?.id
    })
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="w-full max-w-md bg-white rounded-xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <h3 className="font-semibold text-gray-900">
                {step === 1 ? 'Create Highlight' : 'Customize Highlight'}
              </h3>
              <div className="flex items-center space-x-2">
                {step === 2 && (
                  <button
                    onClick={() => setStep(1)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 flex-1 overflow-y-auto">
              {/* Step 1: Select Stories */}
              {step === 1 && (
                <div className="h-full">
                  <p className="text-sm text-gray-600 mb-4">
                    Select up to 5 stories for your highlight.
                  </p>
                  
                  {stories.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">You don't have any stories yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-4">
                      {stories.map(story => (
                        <motion.div
                          key={story.id}
                          whileTap={{ scale: 0.95 }}
                          className={`relative w-full pb-[100%] rounded-lg overflow-hidden cursor-pointer ${
                            selectedStories.some(s => s.id === story.id)
                              ? 'ring-2 ring-primary-500'
                              : 'ring-1 ring-gray-200'
                          }`}
                          onClick={() => toggleStorySelection(story)}
                        >
                          <div className="absolute inset-0">
                            {story.content_type === 'text' ? (
                              <div 
                                className="w-full h-full flex items-center justify-center text-white p-2"
                                style={{ 
                                  background: story.background_style?.value || '#000000'
                                }}
                              >
                                <span className="text-xs text-center truncate leading-tight">
                                  {story.text_content}
                                </span>
                              </div>
                            ) : (
                              <img
                                src={story.media_url || story.thumbnail_url}
                                alt="Story"
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          
                          {/* Selection checkmark */}
                          {selectedStories.some(s => s.id === story.id) && (
                            <div className="absolute top-2 right-2 bg-primary-500 rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                              <FiCheck className="text-white text-sm" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Step 2: Customize Highlight */}
              {step === 2 && (
                <div className="h-full">
                  <div className="flex flex-col items-center space-y-6">
                    {/* Cover Preview */}
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-gray-200">
                      {coverStory?.content_type === 'text' ? (
                        <div 
                          className="w-full h-full flex items-center justify-center text-white p-2"
                          style={{ 
                            background: coverStory.background_style?.value || '#000000'
                          }}
                        >
                          <span className="text-xs text-center truncate leading-tight">
                            {coverStory.text_content}
                          </span>
                        </div>
                      ) : (
                        <img
                          src={coverStory?.media_url || coverStory?.thumbnail_url}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    {/* Title Input */}
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Highlight Name
                      </label>
                      <input
                        type="text"
                        value={highlightTitle}
                        onChange={(e) => setHighlightTitle(e.target.value)}
                        placeholder="Highlight Name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        maxLength={15}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {highlightTitle.length}/15 characters
                      </p>
                    </div>
                    
                    {/* Cover Selection */}
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Cover Photo
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {selectedStories.map(story => (
                          <motion.div
                            key={story.id}
                            whileTap={{ scale: 0.95 }}
                            className={`relative w-full pb-[100%] rounded-lg overflow-hidden cursor-pointer ${
                              coverStory?.id === story.id
                                ? 'ring-2 ring-primary-500'
                                : 'ring-1 ring-gray-200'
                            }`}
                            onClick={() => setCoverStory(story)}
                          >
                            <div className="absolute inset-0">
                              {story.content_type === 'text' ? (
                                <div 
                                  className="w-full h-full flex items-center justify-center text-white"
                                  style={{ 
                                    background: story.background_style?.value || '#000000'
                                  }}
                                >
                                  <span className="text-xs">•</span>
                                </div>
                              ) : (
                                <img
                                  src={story.media_url || story.thumbnail_url}
                                  alt="Story"
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={handleNext}
                disabled={step === 1 ? selectedStories.length === 0 : isLoading}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{step === 1 ? 'Next' : 'Save Highlight'}</span>
                    {step === 1 && <FiArrowRight className="text-sm" />}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default StoryHighlightModal