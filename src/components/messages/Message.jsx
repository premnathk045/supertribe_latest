import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiEdit2, FiTrash2, FiMoreVertical, FiCornerUpLeft } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { useLongPress } from '../../lib/messageUtils'

function Message({ 
  message, 
  isCurrentUser,
  onOptions,
  onReply,
  onEdit,
  onDelete,
  onImageClick
}) {
  const [showMenu, setShowMenu] = useState(false)
  
  // Long press handler
  const longPressProps = useLongPress(() => {
    if (isCurrentUser) {
      onOptions(message.id)
    }
  }, 500)
  
  const renderMessageTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }
  
  const toggleMenu = (e) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }
  
  return (
    <div className="space-y-1">
      {/* Reply reference */}
      {message.reply_to && (
        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-xs px-3 py-1 rounded-lg text-xs ${
            isCurrentUser
              ? 'bg-primary-100 text-primary-800 mr-4'
              : 'bg-gray-200 text-gray-800 ml-4'
          }`}>
            <p className="font-medium">
              {message.reply_to.sender?.profiles?.display_name || 'User'}
            </p>
            <p className="truncate">{message.reply_to.content}</p>
          </div>
        </div>
      )}

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex relative group ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
        {...(isCurrentUser ? longPressProps : {})}
      >
        {!isCurrentUser && (
          <img
            src={message.senderAvatar}
            alt={message.senderName}
            className="w-8 h-8 rounded-full object-cover mr-2 self-end"
          />
        )}
        
        <div className={`relative max-w-xs lg:max-w-md rounded-2xl ${
          isCurrentUser
            ? 'bg-primary-500 text-white'
            : 'bg-white text-gray-900 border border-gray-200'
        }`}>
          {message.message_type === 'text' ? (
            <div className="px-4 py-2">
              <p className="text-sm leading-relaxed break-words">{message.content}</p>
              <div className={`flex items-center text-xs mt-1 ${
                isCurrentUser ? 'text-primary-100' : 'text-gray-500'
              }`}>
                <span>{renderMessageTime(message.created_at)}</span>
                {message.is_edited && (
                  <span className="ml-1">(edited)</span>
                )}
                {isCurrentUser && message.id === message.id && (
                  <span className="ml-1">✓</span>
                )}
              </div>
            </div>
          ) : message.message_type === 'image' && (
            <div className="space-y-1">
              <div 
                className="cursor-pointer overflow-hidden" 
                onClick={() => onImageClick(message.media_url)}
              >
                <img
                  src={message.media_url}
                  alt="Shared image"
                  className="max-w-full rounded-t-lg max-h-60 w-auto object-contain"
                />
              </div>
              {message.content && message.content !== 'Image' && (
                <div className="px-4 py-2">
                  <p className="text-sm">{message.content}</p>
                </div>
              )}
              <div className={`flex items-center text-xs px-4 pb-2 ${
                isCurrentUser ? 'text-primary-100' : 'text-gray-500'
              }`}>
                <span>{renderMessageTime(message.created_at)}</span>
              </div>
            </div>
          )}

          {/* Message options */}
          {isCurrentUser && (
            <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={toggleMenu}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <FiMoreVertical className="text-gray-600 text-sm" />
              </button>
              
              {showMenu && (
                <div className="absolute right-full top-0 mt-2 mr-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onEdit(message);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                  >
                    <FiEdit2 className="text-gray-600" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete(message);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-red-50 transition-colors text-red-600"
                  >
                    <FiTrash2 />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reply button */}
          <div className={`absolute ${
            isCurrentUser ? '-left-10' : '-right-10'
          } bottom-0 opacity-0 group-hover:opacity-100 transition-opacity`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReply(message);
              }}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <FiCornerUpLeft className="text-gray-600 text-sm" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Message