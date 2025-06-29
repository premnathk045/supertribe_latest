import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiChevronRight, FiChevronLeft } from 'react-icons/fi'
import StoryHighlightItem from './StoryHighlightItem'

function StoryHighlights({ highlights = [], isEditable, onAddHighlight, onViewHighlight, onEditHighlight }) {
  const scrollRef = useRef(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  
  // Check if scrolling is needed
  useEffect(() => {
    const checkScroll = () => {
      if (!scrollRef.current) return
      
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
    
    checkScroll()
    
    // Add event listener for scroll
    const currentRef = scrollRef.current
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScroll)
    }
    
    // Check on window resize
    window.addEventListener('resize', checkScroll)
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScroll)
      }
      window.removeEventListener('resize', checkScroll)
    }
  }, [highlights])
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef
      const scrollAmount = 200
      
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }
  
  // If no highlights and not editable, don't show anything
  if (highlights.length === 0 && !isEditable) {
    return null
  }
  
  return (
    <div className="relative py-6 mb-2">
      {/* Left scroll arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1"
        >
          <FiChevronLeft className="text-gray-700" />
        </button>
      )}
      
      {/* Right scroll arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1"
        >
          <FiChevronRight className="text-gray-700" />
        </button>
      )}
      
      {/* Scrollable container */}
      <div 
        ref={scrollRef}
        className="flex space-x-5 overflow-x-auto scrollbar-hide px-4"
      >
        {/* Add new highlight button (only if editable) */}
        {isEditable && (
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={onAddHighlight}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-16 h-16 rounded-full border-2 border-gray-300 border-dashed flex items-center justify-center">
              <FiPlus className="text-gray-500" />
            </div>
            <span className="text-xs text-gray-700">
              New
            </span>
          </motion.div>
        )}
        
        {/* Story highlight items */}
        {highlights.map((highlight) => (
          <StoryHighlightItem
            key={highlight.id}
            highlight={highlight}
            onClick={onViewHighlight}
            isEditable={isEditable}
            onEdit={onEditHighlight}
          />
        ))}
        
        {/* Empty state */}
        {highlights.length === 0 && isEditable && (
          <div className="flex items-center justify-center pl-4">
            <p className="text-sm text-gray-500 italic">
              Create your first highlight
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StoryHighlights