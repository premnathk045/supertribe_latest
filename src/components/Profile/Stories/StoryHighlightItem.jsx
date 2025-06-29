import { motion } from 'framer-motion'

function StoryHighlightItem({ highlight, onClick, isEditable, onEdit }) {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(highlight)}
      className="flex flex-col items-center space-y-1"
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[2px]">
          <div className="w-full h-full rounded-full overflow-hidden bg-white p-[1px]">
            <img 
              src={highlight.cover_url || highlight.media_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'}
              alt={highlight.title}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
        
        {isEditable && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              onEdit(highlight)
            }}
            className="absolute -right-1 -bottom-1 bg-white rounded-full p-1 shadow-md"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </motion.button>
        )}
      </div>
      <span className="text-xs text-gray-700 truncate max-w-[64px]">
        {highlight.title}
      </span>
    </motion.div>
  )
}

export default StoryHighlightItem