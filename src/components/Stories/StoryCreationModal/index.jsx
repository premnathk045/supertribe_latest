import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { useAuth } from '../../../contexts/AuthContext'
import { createStory, uploadStoryMedia, generateVideoThumbnail } from '../../../lib/stories'
import ModalHeader from './components/ModalHeader'
import BottomTabNavigation from './components/BottomTabNavigation'
import PhotoMode from './modes/PhotoMode'
import VideoMode from './modes/VideoMode'
import TextMode from './modes/TextMode'
import GalleryMode from './modes/GalleryMode'
import PreviewMode from './modes/PreviewMode'
import PermissionModal from './components/PermissionModal'
import { useStoryCreation } from './hooks/useStoryCreation'
import { STORY_MODES } from './constants'

function StoryCreationModal({ isOpen, onClose, onPublish }) {
  const { user } = useAuth()
  const {
    currentMode,
    setCurrentMode,
    storyData,
    updateStoryData,
    resetStoryData,
    permissions,
    requestPermission,
    showPermissionModal,
    setShowPermissionModal
  } = useStoryCreation()

  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState(null)
  const modalRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      resetStoryData()
      setIsPreviewMode(false)
      setIsPublishing(false)
      setPublishError(null)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, resetStoryData])

  const handleClose = () => {
    if (isPreviewMode) {
      setIsPreviewMode(false)
    } else {
      onClose()
    }
  }

  const handleModeChange = (mode) => {
    if (mode === STORY_MODES.GALLERY) {
      if (!permissions.photos) {
        requestPermission('photos')
        return
      }
    } else if (mode === STORY_MODES.PHOTO || mode === STORY_MODES.VIDEO) {
      if (!permissions.camera) {
        requestPermission('camera')
        return
      }
      if (mode === STORY_MODES.VIDEO && !permissions.microphone) {
        requestPermission('microphone')
        return
      }
    }
    setCurrentMode(mode)
  }

  const handlePreview = () => {
    setIsPreviewMode(true)
  }

  const handlePublish = async () => {
    if (!user) {
      setPublishError('You must be signed in to publish stories')
      return
    }

    setIsPublishing(true)
    setPublishError(null)

    try {
      let mediaUrl = null
      let mediaPath = null
      let thumbnailUrl = null
      let fileSize = null
      let fileType = null
      let duration = null

      // Handle media upload for photo/video/gallery stories
      if (storyData.media && (storyData.type === 'photo' || storyData.type === 'video' || storyData.type === 'gallery')) {
        console.log('Uploading media file:', storyData.media)
        
        const uploadResult = await uploadStoryMedia(storyData.media, user.id)
        mediaUrl = uploadResult.url
        mediaPath = uploadResult.path
        fileSize = storyData.media.size
        fileType = storyData.media.type

        // Generate thumbnail for videos
        if (storyData.type === 'video' && storyData.media.type.startsWith('video/')) {
          try {
            const thumbnailBlob = await generateVideoThumbnail(storyData.media)
            if (thumbnailBlob) {
              const thumbnailUpload = await uploadStoryMedia(thumbnailBlob, user.id)
              thumbnailUrl = thumbnailUpload.url
            }
          } catch (thumbnailError) {
            console.warn('Failed to generate video thumbnail:', thumbnailError)
          }
        }
      }

      // Prepare story data for database
      const storyPayload = {
        creator_id: user.id,
        content_type: storyData.type,
        media_url: mediaUrl,
        media_path: mediaPath,
        caption: storyData.caption || null,
        text_content: storyData.type === 'text' ? storyData.text : null,
        text_style: storyData.type === 'text' ? storyData.textStyle : {},
        background_style: storyData.type === 'text' ? storyData.background : {},
        file_size: fileSize,
        file_type: fileType,
        duration: duration,
        thumbnail_url: thumbnailUrl
      }

      console.log('Creating story with payload:', storyPayload)

      // Create story in database
      const newStory = await createStory(storyPayload)
      
      console.log('Story created successfully:', newStory)

      // Call the onPublish callback with the new story
      if (onPublish) {
        onPublish(newStory)
      }

      // Close the modal
      onClose()
    } catch (error) {
      console.error('Error publishing story:', error)
      setPublishError(error.message || 'Failed to publish story. Please try again.')
    } finally {
      setIsPublishing(false)
    }
  }

  const renderCurrentMode = () => {
    if (isPreviewMode) {
      return (
        <PreviewMode
          storyData={storyData}
          onBack={() => setIsPreviewMode(false)}
          onPublish={handlePublish}
          onUpdateData={updateStoryData}
          isPublishing={isPublishing}
          publishError={publishError}
        />
      )
    }

    switch (currentMode) {
      case STORY_MODES.PHOTO:
        return (
          <PhotoMode
            onCapture={(data) => updateStoryData(data)}
            onPreview={handlePreview}
          />
        )
      case STORY_MODES.VIDEO:
        return (
          <VideoMode
            onCapture={(data) => updateStoryData(data)}
            onPreview={handlePreview}
          />
        )
      case STORY_MODES.TEXT:
        return (
          <TextMode
            storyData={storyData}
            onUpdate={updateStoryData}
            onPreview={handlePreview}
          />
        )
      case STORY_MODES.GALLERY:
        return (
          <GalleryMode
            onSelect={(data) => updateStoryData(data)}
            onPreview={handlePreview}
          />
        )
      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black"
          style={{ touchAction: 'none' }}
        >
          {/* Header */}
          <ModalHeader
            onClose={handleClose}
            isPreviewMode={isPreviewMode}
            currentMode={currentMode}
          />

          {/* Main Content */}
          <div className="flex-1 h-full relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={isPreviewMode ? 'preview' : currentMode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="h-full"
              >
                {renderCurrentMode()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Navigation */}
          {!isPreviewMode && (
            <BottomTabNavigation
              currentMode={currentMode}
              onModeChange={handleModeChange}
              permissions={permissions}
            />
          )}

          {/* Permission Modal */}
          <PermissionModal
            isOpen={showPermissionModal.show}
            type={showPermissionModal.type}
            onClose={() => setShowPermissionModal({ show: false, type: null })}
            onRetry={() => requestPermission(showPermissionModal.type)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default StoryCreationModal