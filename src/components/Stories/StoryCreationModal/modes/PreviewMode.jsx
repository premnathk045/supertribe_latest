import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiDownload, FiEdit3, FiAlertCircle } from 'react-icons/fi'
import { TEXT_FONTS } from '../constants'

function PreviewMode({ storyData, onBack, onPublish, onUpdateData, isPublishing, publishError }) {
  const [caption, setCaption] = useState(storyData.caption || '')

  const handlePublish = async () => {
    // Update story data with caption before publishing
    await onUpdateData(prev => ({ ...prev, caption }))
    await onPublish()
  }

  const getBackgroundStyle = () => {
    if (storyData.type === 'text') {
      if (storyData.background?.type === 'gradient') {
        return { background: storyData.background.value }
      }
      return { backgroundColor: storyData.background?.value || '#000000' }
    }
    return {}
  }

  const getTextClassName = () => {
    if (storyData.type !== 'text') return ''
    
    const font = TEXT_FONTS[storyData.textStyle?.font || 0]
    let className = font.className
    
    if (storyData.textStyle?.bold) className += ' font-bold'
    if (storyData.textStyle?.italic) className += ' italic'
    
    return className
  }

  return (
    <div className="h-full relative bg-black">
      {/* Content Preview */}
      <div className="w-full h-full flex items-center justify-center" style={getBackgroundStyle()}>
        {storyData.type === 'text' ? (
          /* Text Story */
          <div
            className={`max-w-md p-4 text-center ${getTextClassName()}`}
            style={{
              color: storyData.textStyle?.color || '#ffffff',
              fontSize: `${storyData.textStyle?.size || 24}px`,
              textAlign: storyData.textStyle?.align || 'center',
              lineHeight: '1.2'
            }}
          >
            {storyData.text}
          </div>
        ) : storyData.type === 'photo' || storyData.type === 'gallery' ? (
          /* Photo Story */
          <img
            src={storyData.mediaUrl}
            alt="Story preview"
            className="w-full h-full object-cover"
          />
        ) : storyData.type === 'video' ? (
          /* Video Story */
          <video
            src={storyData.mediaUrl}
            controls
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>

      {/* Caption Input */}
      <div className="absolute bottom-32 left-4 right-4 z-10">
        <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="w-full bg-transparent text-white placeholder-white/70 border-none outline-none text-sm"
            maxLength={200}
          />
          <div className="text-right mt-1">
            <span className="text-white/50 text-xs">{caption.length}/200</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {publishError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-4 right-4 z-10"
        >
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg flex items-center space-x-2">
            <FiAlertCircle className="text-lg flex-shrink-0" />
            <p className="text-sm">{publishError}</p>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="absolute bottom-8 left-0 right-0 px-6">
        <div className="flex items-center justify-center space-x-4">
          {/* Edit Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            disabled={isPublishing}
            className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm border border-white/30 flex items-center justify-center disabled:opacity-50"
          >
            <FiEdit3 className="text-white text-xl" />
          </motion.button>

          {/* Download Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            disabled={isPublishing}
            className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm border border-white/30 flex items-center justify-center disabled:opacity-50"
          >
            <FiDownload className="text-white text-xl" />
          </motion.button>

          {/* Publish Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex-1 max-w-48 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white py-4 rounded-full font-semibold transition-all flex items-center justify-center space-x-2"
          >
            {isPublishing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <FiSend className="text-xl" />
                <span>Share to Story</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default PreviewMode