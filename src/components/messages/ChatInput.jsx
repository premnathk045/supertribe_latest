import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiImage, FiSmile, FiX, FiCheck } from 'react-icons/fi'

function ChatInput({ 
  value, 
  onChange, 
  onSend, 
  onTyping,
  imageUpload,
  onImageSelect,
  onImageRemove,
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  isSubmitting
}) {
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  
  // Focus input when editing or replying
  useEffect(() => {
    if ((editingMessage || replyingTo) && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingMessage, replyingTo])
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onSend(e)
  }
  
  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="max-w-lg mx-auto">
        {/* Reply indicator */}
        {replyingTo && (
          <div className="bg-gray-100 px-4 py-2 rounded-t-xl border border-gray-200 flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-10 bg-primary-500 rounded-full"></div>
              <div>
                <p className="text-xs text-gray-500">
                  Replying to <span className="font-medium">{replyingTo.senderName}</span>
                </p>
                <p className="text-sm text-gray-700 truncate">{replyingTo.content}</p>
              </div>
            </div>
            <button
              onClick={onCancelReply}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <FiX className="text-gray-500" />
            </button>
          </div>
        )}
        
        {/* Edit indicator */}
        {editingMessage && (
          <div className="bg-blue-50 px-4 py-2 rounded-t-xl border border-blue-200 flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-10 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-xs text-blue-500 font-medium">
                  Editing message
                </p>
                <p className="text-sm text-blue-700 truncate">{editingMessage.content}</p>
              </div>
            </div>
            <button
              onClick={onCancelEdit}
              className="p-1 hover:bg-blue-100 rounded-full transition-colors"
            >
              <FiX className="text-blue-500" />
            </button>
          </div>
        )}

        {/* Image preview */}
        {imageUpload?.preview && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 mb-2">
            <div className="flex items-start space-x-3">
              <div className="relative w-20 h-20">
                <img 
                  src={imageUpload.preview} 
                  alt="Upload preview" 
                  className="w-full h-full rounded-md object-cover"
                />
                <button
                  onClick={onImageRemove}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <FiX className="text-xs" />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Ready to send image</p>
                <p className="text-xs text-gray-500">Optional: Add a caption below</p>
                {imageUpload.error && (
                  <p className="text-xs text-red-500 mt-1">{imageUpload.error}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => onImageSelect(e)}
          accept="image/*"
          className="hidden"
        />
        
        <form 
          onSubmit={handleSubmit}
          className="flex items-center space-x-3"
        >
          <button
            type="button"
            onClick={handleFileSelect}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiImage className="text-xl" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={onChange}
              onKeyDown={onTyping}
              placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
              className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiSmile className="text-lg" />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={(!value.trim() && !imageUpload?.preview) || isSubmitting}
            className="p-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-full transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : editingMessage ? (
              <FiCheck className="text-lg" />
            ) : (
              <FiSend className="text-lg" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatInput