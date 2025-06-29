import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Message from './Message'
import LoadingSpinner from '../UI/LoadingSpinner'

function MessageList({ 
  messages, 
  loading, 
  error, 
  userId,
  onMessageOptions,
  onMessageReply,
  onMessageEdit,
  onMessageDelete,
  onImageClick,
  typingUser
}) {
  const messagesEndRef = useRef(null)
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">Failed to load messages</p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary-500 hover:text-primary-600 font-medium"
        >
          Try again
        </button>
      </div>
    )
  }
  
  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No messages yet
        </h3>
        <p className="text-gray-600">
          Send a message to start the conversation
        </p>
      </div>
    )
  }
  
  return (
    <div className="max-w-lg mx-auto space-y-4">
      {messages.map((message, index) => {
        const isCurrentUser = message.sender_id === userId
        
        return (
          <Message 
            key={message.id} 
            message={message}
            isCurrentUser={isCurrentUser}
            onOptions={onMessageOptions}
            onReply={onMessageReply}
            onEdit={onMessageEdit}
            onDelete={onMessageDelete}
            onImageClick={onImageClick}
          />
        )
      })}

      {/* Typing indicator */}
      {typingUser && (
        <div className="flex items-end space-x-2">
          <img
            src={typingUser.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
            alt={typingUser.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="bg-white px-4 py-3 rounded-2xl border border-gray-200 inline-flex">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList