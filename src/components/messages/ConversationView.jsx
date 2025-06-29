import { useState } from 'react'
import ChatHeader from './ChatHeader'
import ChatInput from './ChatInput'
import MessageList from './MessageList'

function ConversationView({ 
  chat, 
  messages, 
  loading, 
  error, 
  userId,
  sendingState,
  imageUpload,
  onBack,
  onSendMessage,
  onImageSelect,
  onImageRemove,
  onTyping,
  onReply,
  onEdit,
  onCancelEdit,
  onDelete,
  onImageClick,
  replyingTo,
  editingMessage,
  onCancelReply
}) {
  const [newMessage, setNewMessage] = useState('')
  
  const handleSend = (e) => {
    e.preventDefault()
    onSendMessage(newMessage)
    setNewMessage('')
  }
  
  const handleChange = (e) => {
    setNewMessage(e.target.value)
  }
  
  // Get typing user
  const getTypingUser = () => {
    // This would come from the presence hook in a real implementation
    return null
  }
  
  return (
    <>
      {/* Chat Header */}
      <ChatHeader chat={chat} onBack={onBack} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <MessageList
          messages={messages}
          loading={loading}
          error={error}
          userId={userId}
          onMessageOptions={onEdit}
          onMessageReply={onReply}
          onMessageEdit={onEdit}
          onMessageDelete={onDelete}
          onImageClick={onImageClick}
          typingUser={getTypingUser()}
        />
      </div>

      {/* Chat Input */}
      <ChatInput 
        value={newMessage}
        onChange={handleChange}
        onSend={handleSend}
        onTyping={onTyping}
        imageUpload={imageUpload}
        onImageSelect={onImageSelect}
        onImageRemove={onImageRemove}
        replyingTo={replyingTo}
        onCancelReply={onCancelReply}
        editingMessage={editingMessage}
        onCancelEdit={onCancelEdit}
        isSubmitting={sendingState.sending || imageUpload.loading}
      />
    </>
  )
}

export default ConversationView