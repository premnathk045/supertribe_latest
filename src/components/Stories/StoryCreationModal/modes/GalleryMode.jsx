import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiImage, FiVideo, FiCheck, FiX } from 'react-icons/fi'
import { useDropzone } from 'react-dropzone'

function GalleryMode({ onSelect, onPreview }) {
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [mediaList, setMediaList] = useState([])
  const [filter, setFilter] = useState('all') // all, photos, videos

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    multiple: true,
    onDrop: (acceptedFiles) => {
      const newMedia = acceptedFiles.map((file) => ({
        id: Date.now() + Math.random(),
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video') ? 'video' : 'image',
        name: file.name,
        size: file.size
      }))
      
      setMediaList(prev => [...newMedia, ...prev])
    }
  })

  const handleMediaSelect = (media) => {
    setSelectedMedia(media)
    onSelect({
      type: media.type,
      media: media.file,
      mediaUrl: media.url
    })
  }

  const confirmSelection = () => {
    if (selectedMedia) {
      onPreview()
    }
  }

  const filteredMedia = mediaList.filter(media => {
    if (filter === 'photos') return media.type === 'image'
    if (filter === 'videos') return media.type === 'video'
    return true
  })

  return (
    <div className="h-full bg-black flex flex-col">
      {/* Filter Tabs */}
      <div className="flex justify-center space-x-1 p-4 bg-gray-900">
        {[
          { id: 'all', label: 'All' },
          { id: 'photos', label: 'Photos' },
          { id: 'videos', label: 'Videos' }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === tab.id
                ? 'bg-white text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto">
        {mediaList.length === 0 ? (
          /* Upload Area */
          <div className="h-full flex items-center justify-center p-8">
            <div
              {...getRootProps()}
              className={`w-full max-w-md border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <FiImage className="text-4xl text-gray-400" />
                  <FiVideo className="text-4xl text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-white mb-2">
                    {isDragActive ? 'Drop files here' : 'Select photos or videos'}
                  </p>
                  <p className="text-gray-400">
                    Drag and drop or click to browse
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Media Grid */
          <div className="grid grid-cols-3 gap-1 p-4">
            {filteredMedia.map((media, index) => (
              <motion.div
                key={media.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMediaSelect(media)}
                className={`aspect-square relative cursor-pointer rounded-lg overflow-hidden ${
                  selectedMedia?.id === media.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt={media.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <FiVideo className="text-white text-2xl" />
                    </div>
                  </div>
                )}

                {/* Selection Indicator */}
                {selectedMedia?.id === media.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <FiCheck className="text-white text-sm" />
                  </motion.div>
                )}

                {/* Media Type Indicator */}
                {media.type === 'video' && (
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    Video
                  </div>
                )}
              </motion.div>
            ))}

            {/* Add More Button */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              {...getRootProps()}
              className="aspect-square border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <FiImage className="text-2xl text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Add more</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Confirm Button */}
      {selectedMedia && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 bg-gray-900"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={confirmSelection}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-colors"
          >
            Continue with selected media
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}

export default GalleryMode