import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiPlay, 
  FiPause, 
  FiVolume2, 
  FiVolumeX,
  FiMaximize,
  FiMinimize
} from 'react-icons/fi'

function VideoPlayer({ 
  src, 
  poster = null, 
  autoPlay = true, 
  isInView = true,
  className = '',
  onProgress = () => {},
  onEnded = () => {}
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const progressInterval = useRef(null)
  const hideControlsTimeout = useRef(null)
  
  // Initialize video when src changes
  useEffect(() => {
    if (videoRef.current && src) {
      setIsLoading(true)
      setError(null)
      videoRef.current.load()
    }
  }, [src])
  
  // Auto-play when in view
  useEffect(() => {
    if (videoRef.current && isInView && autoPlay) {
      playVideo().catch(err => {
        console.log('Auto-play prevented:', err)
      })
    } else if (videoRef.current && !isInView) {
      pauseVideo()
    }
    
    return () => {
      pauseVideo()
    }
  }, [isInView, autoPlay])
  
  // Progress tracking
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      progressInterval.current = setInterval(() => {
        const video = videoRef.current
        if (video) {
          const currentProgress = (video.currentTime / video.duration) * 100
          setProgress(currentProgress)
          setCurrentTime(video.currentTime)
          onProgress(currentProgress, video.currentTime)
        }
      }, 100)
    } else {
      clearInterval(progressInterval.current)
    }
    
    return () => clearInterval(progressInterval.current)
  }, [isPlaying, onProgress])
  
  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      clearTimeout(hideControlsTimeout.current)
      hideControlsTimeout.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 2000)
    }
    
    return () => clearTimeout(hideControlsTimeout.current)
  }, [showControls, isPlaying])
  
  // Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement === containerRef.current ||
        document.webkitFullscreenElement === containerRef.current
      )
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])
  
  // Play video
  const playVideo = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play()
        setIsPlaying(true)
      } catch (err) {
        console.error('Error playing video:', err)
        setError('Could not play video automatically')
      }
    }
  }
  
  // Pause video
  const pauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }
  
  // Toggle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      pauseVideo()
    } else {
      playVideo()
    }
  }
  
  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      }
    }
  }
  
  // Handle video click
  const handleVideoClick = () => {
    setShowControls(true)
    if (!showControls) {
      // If controls are hidden, just show them on first click
      return
    }
    togglePlayPause()
  }
  
  // Handle video loaded metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      setIsLoading(false)
      
      // Set initial muted state
      videoRef.current.muted = isMuted
    }
  }
  
  // Handle video loading
  const handleLoadStart = () => {
    setIsLoading(true)
  }
  
  // Handle video loaded
  const handleLoadedData = () => {
    setIsLoading(false)
  }
  
  // Handle video error
  const handleError = (e) => {
    console.error('Video error:', e)
    setError('Failed to load video')
    setIsLoading(false)
  }
  
  // Handle seeking
  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const position = (e.clientX - rect.left) / rect.width
    const seekTime = duration * position
    
    videoRef.current.currentTime = seekTime
    setCurrentTime(seekTime)
    setProgress((seekTime / duration) * 100)
  }
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00'
    
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div 
      ref={containerRef}
      className={`relative bg-black overflow-hidden group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onMouseMove={() => setShowControls(true)}
      onTouchStart={() => setShowControls(true)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        playsInline
        onClick={handleVideoClick}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadStart={handleLoadStart}
        onLoadedData={handleLoadedData}
        onError={handleError}
        onEnded={() => {
          setIsPlaying(false)
          onEnded()
        }}
      />
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-center text-white p-4">
            <div className="text-4xl mb-2">⚠️</div>
            <p>{error}</p>
            <button 
              onClick={() => {
                setError(null)
                if (videoRef.current) {
                  videoRef.current.load()
                }
              }}
              className="mt-4 px-4 py-2 bg-white text-black rounded-lg font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Video Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/70 to-transparent"
          >
            {/* Top Controls */}
            <div className="flex justify-end">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullscreen}
                className="p-2 bg-black/40 rounded-full text-white"
              >
                {isFullscreen ? <FiMinimize /> : <FiMaximize />}
              </motion.button>
            </div>
            
            {/* Bottom Controls */}
            <div className="space-y-2">
              {/* Progress Bar */}
              <div 
                className="w-full h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
                onClick={handleSeek}
              >
                <motion.div 
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              
              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePlayPause}
                    className="p-2 text-white"
                  >
                    {isPlaying ? <FiPause className="text-xl" /> : <FiPlay className="text-xl" />}
                  </motion.button>
                  
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleMute}
                    className="p-2 text-white"
                  >
                    {isMuted ? <FiVolumeX className="text-xl" /> : <FiVolume2 className="text-xl" />}
                  </motion.button>
                  
                  <div className="text-sm text-white">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Big Play Button (when paused) */}
      <AnimatePresence>
        {!isPlaying && !isLoading && !error && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlayPause}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
              <FiPlay className="text-white text-2xl ml-1" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VideoPlayer