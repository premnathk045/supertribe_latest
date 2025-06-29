import { useState, useCallback, useRef } from 'react'
import { STORY_MODES, PERMISSION_TYPES } from '../constants'

export function useStoryCreation() {
  const [currentMode, setCurrentMode] = useState(STORY_MODES.PHOTO)
  const [storyData, setStoryData] = useState({
    type: null,
    media: null,
    mediaUrl: null,
    text: '',
    textStyle: {
      font: 0,
      size: 24,
      color: '#ffffff',
      align: 'center',
      bold: false,
      italic: false
    },
    background: {
      type: 'solid',
      value: '#000000'
    },
    duration: null,
    timestamp: null
  })

  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false,
    photos: false
  })

  const [showPermissionModal, setShowPermissionModal] = useState({
    show: false,
    type: null
  })

  const streamRef = useRef(null)

  const updateStoryData = useCallback((updates) => {
    setStoryData(prev => ({
      ...prev,
      ...updates,
      timestamp: Date.now()
    }))
  }, [])

  const resetStoryData = useCallback(() => {
    setStoryData({
      type: null,
      media: null,
      mediaUrl: null,
      text: '',
      textStyle: {
        font: 0,
        size: 24,
        color: '#ffffff',
        align: 'center',
        bold: false,
        italic: false
      },
      background: {
        type: 'solid',
        value: '#000000'
      },
      duration: null,
      timestamp: null
    })
    
    // Cleanup media streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  const requestPermission = useCallback(async (type) => {
    try {
      let granted = false

      switch (type) {
        case PERMISSION_TYPES.CAMERA:
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
              video: true,
              audio: false 
            })
            stream.getTracks().forEach(track => track.stop())
            granted = true
          } catch (error) {
            console.error('Camera permission denied:', error)
          }
          break

        case PERMISSION_TYPES.MICROPHONE:
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
              audio: true,
              video: false 
            })
            stream.getTracks().forEach(track => track.stop())
            granted = true
          } catch (error) {
            console.error('Microphone permission denied:', error)
          }
          break

        case PERMISSION_TYPES.PHOTOS:
          // For web, we'll simulate photo permission
          // In a real app, this would use the File System Access API
          granted = true
          break

        default:
          break
      }

      if (granted) {
        setPermissions(prev => ({
          ...prev,
          [type]: true
        }))
        setShowPermissionModal({ show: false, type: null })
      } else {
        setShowPermissionModal({ show: true, type })
      }

      return granted
    } catch (error) {
      console.error('Permission request failed:', error)
      setShowPermissionModal({ show: true, type })
      return false
    }
  }, [])

  return {
    currentMode,
    setCurrentMode,
    storyData,
    updateStoryData,
    resetStoryData,
    permissions,
    requestPermission,
    showPermissionModal,
    setShowPermissionModal,
    streamRef
  }
}