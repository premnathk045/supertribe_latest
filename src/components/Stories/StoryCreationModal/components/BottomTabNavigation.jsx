import { motion } from 'framer-motion'
import { FiCamera, FiVideo, FiType, FiImage } from 'react-icons/fi'
import { STORY_MODES } from '../constants'

const tabs = [
  { id: STORY_MODES.GALLERY, label: 'Gallery', icon: FiImage },
  { id: STORY_MODES.PHOTO, label: 'Photo', icon: FiCamera },
  { id: STORY_MODES.VIDEO, label: 'Video', icon: FiVideo },
  { id: STORY_MODES.TEXT, label: 'Text', icon: FiType }
]

function BottomTabNavigation({ currentMode, onModeChange, permissions }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="absolute bottom-0 left-0 right-0 z-20"
    >
      {/* Tab Navigation */}
      <div className="bg-gradient-to-t from-black/80 to-transparent px-4 pb-8 pt-6">
        <div className="flex items-center justify-center space-x-6">
          {tabs.map((tab) => {
            const isActive = currentMode === tab.id
            const Icon = tab.icon
            
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => onModeChange(tab.id)}
                className="flex flex-col items-center space-y-2 min-w-0"
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    opacity: isActive ? 1 : 0.7
                  }}
                  transition={{ duration: 0.2 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isActive 
                      ? 'bg-white text-black' 
                      : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'
                  }`}
                >
                  <Icon className="text-xl" />
                </motion.div>
                
                <motion.span
                  animate={{
                    color: isActive ? '#ffffff' : '#ffffff80',
                    fontWeight: isActive ? 600 : 400
                  }}
                  transition={{ duration: 0.2 }}
                  className="text-sm"
                >
                  {tab.label}
                </motion.span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

export default BottomTabNavigation