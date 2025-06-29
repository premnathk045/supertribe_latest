import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiSearch, FiPlus, FiHash } from 'react-icons/fi'

const POPULAR_TAGS = [
  'art', 'photography', 'design', 'tech', 'music', 'fitness', 'food', 'travel',
  'fashion', 'lifestyle', 'business', 'education', 'gaming', 'beauty', 'health'
]

function TagSelectorModal({ isOpen, onClose, selectedTags, onTagsChange, maxTags = 10 }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [customTag, setCustomTag] = useState('')
  const [filteredTags, setFilteredTags] = useState(POPULAR_TAGS)

  useEffect(() => {
    if (searchQuery) {
      const filtered = POPULAR_TAGS.filter(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredTags(filtered)
    } else {
      setFilteredTags(POPULAR_TAGS)
    }
  }, [searchQuery])

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag))
    } else if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag])
    }
  }

  const handleAddCustomTag = () => {
    const tag = customTag.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    if (tag && !selectedTags.includes(tag) && selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag])
      setCustomTag('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCustomTag()
    }
  }

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
            className="w-full max-w-lg bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add Tags</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Selected ({selectedTags.length}/{maxTags})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <motion.button
                      key={tag}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTagToggle(tag)}
                      className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 hover:bg-primary-200 transition-colors"
                    >
                      <FiHash className="text-xs" />
                      <span>{tag}</span>
                      <FiX className="text-xs" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tags..."
                className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
            </div>

            {/* Add Custom Tag */}
            <div className="mb-6">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Create custom tag..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    maxLength={20}
                  />
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddCustomTag}
                  disabled={!customTag.trim() || selectedTags.length >= maxTags}
                  className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2"
                >
                  <FiPlus className="text-lg" />
                </motion.button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Only letters and numbers allowed
              </p>
            </div>

            {/* Popular Tags */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Tags</h3>
              <div className="grid grid-cols-2 gap-2">
                {filteredTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag)
                  const isDisabled = !isSelected && selectedTags.length >= maxTags

                  return (
                    <motion.button
                      key={tag}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTagToggle(tag)}
                      disabled={isDisabled}
                      className={`p-3 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                          : isDisabled
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <FiHash className="text-sm" />
                        <span className="font-medium">{tag}</span>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Done ({selectedTags.length} tags)
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TagSelectorModal