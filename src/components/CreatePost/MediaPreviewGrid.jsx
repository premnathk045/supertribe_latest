import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiPlay, FiImage, FiVideo } from 'react-icons/fi'
import UploadProgressBar from './UploadProgressBar'

function MediaPreviewGrid({ media, onRemove, uploadProgress, onReorder }) {
  const [draggedIndex, setDraggedIndex] = useState(null)

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
  }

  const getMediaIcon = (type) => {
    return type.startsWith('video/') ? FiVideo : FiImage
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (media.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Media ({media.length})</h3>
        <p className="text-sm text-gray-500">Drag to reorder</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AnimatePresence>
          {media.map((item, index) => {
            const Icon = getMediaIcon(item.type)
            const progress = uploadProgress[item.id] || 0
            const isUploading = progress > 0 && progress < 100

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative aspect-square bg-gray-100 rounded-xl overflow-hidden group cursor-move ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                {/* Media Preview */}
                {item.preview ? (
                  item.type.startsWith('video/') ? (
                    <div className="relative w-full h-full">
                      <video
                        src={item.preview}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <FiPlay className="text-white text-2xl" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className="text-4xl text-gray-400" />
                  </div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <UploadProgressBar progress={progress} size="sm" />
                      <p className="text-xs mt-2">{Math.round(progress)}%</p>
                    </div>
                  </div>
                )}

                {/* Media Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <div className="flex items-center space-x-1 text-white text-xs">
                    <Icon className="text-sm" />
                    <span>{formatFileSize(item.size)}</span>
                  </div>
                </div>

                {/* Remove Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onRemove(item.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiX className="text-sm" />
                </motion.button>

                {/* Order Indicator */}
                <div className="absolute top-2 left-2 w-6 h-6 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {index + 1}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MediaPreviewGrid