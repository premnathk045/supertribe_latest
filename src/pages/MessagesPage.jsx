import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useConversations } from '../hooks/useConversations'
import { useMessages } from '../hooks/useMessages'
import { usePresence } from '../hooks/usePresence'

// Import components
import ChatList from '../components/messages/ChatList'
import ConversationView from '../components/messages/ConversationView'
import NewChatModal from '../components/messages/NewChatModal'
import DeleteConfirmModal from '../components/messages/DeleteConfirmModal'
import ErrorModal from '../components/messages/ErrorModal'
import ImagePreview from '../components/messages/ImagePreview'

function MessagesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // State
  const [selectedChat, setSelectedChat] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [editingMessage, setEditingMessage] = useState(null)
  const [showOptions, setShowOptions] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [userSearchError, setUserSearchError] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [showErrorModal, setShowErrorModal] = useState(null)
  
  // Image preview state
  const [previewImage, setPreviewImage] = useState({
    isOpen: false,
    url: null
  })

  // Fetch conversations
  const { 
    conversations, 
    loading: conversationsLoading, 
    error: conversationsError,
    getOrCreateDirectConversation
  } = useConversations()

  // Fetch messages for selected conversation
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sending,
    imageUpload,
    sendMessage,
    sendImageMessage,
    editMessage,
    deleteMessage,
    setImagePreview,
    clearImagePreview,
    markAsRead
  } = useMessages(selectedChat?.id)

  // User presence
  const {
    fetchPresence,
    setTypingIndicator,
    clearTypingIndicator,
    isUserTyping,
    getUserStatus
  } = usePresence()

  // Filter conversations based on search query
  const filteredConversations = searchQuery
    ? conversations.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations

  // Fetch users from the database
  const fetchUsers = async () => {
    if (!user) return
    
    try {
      setIsLoadingUsers(true)
      setUserSearchError(null)
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          avatar_url,
          is_verified,
          user_type
        `)
        .neq('id', user.id)
        .limit(10)
      
      if (error) throw error
      
      setSuggestedUsers(data || [])
      setFilteredUsers(data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
      setUserSearchError('Failed to load users')
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Filter users based on search query
  const filterUsers = (query) => {
    if (!query.trim()) {
      setFilteredUsers(suggestedUsers)
      return
    }
    
    const lowercaseQuery = query.toLowerCase().trim()
    const filtered = suggestedUsers.filter(user => {
      const displayName = user.display_name?.toLowerCase() || ''
      const username = user.username?.toLowerCase() || ''
      
      return displayName.includes(lowercaseQuery) || 
             username.includes(lowercaseQuery)
    })
    
    setFilteredUsers(filtered)
  }

  // Handle user search input changes
  const handleUserSearchChange = (e) => {
    const query = e.target.value
    setUserSearchQuery(query)
    filterUsers(query)
  }

  // Handle sending a message
  const handleSendMessage = async (message) => {
    if ((!message.trim() && !imageFile) || !selectedChat) return

    try {
      if (imageFile) {
        // Send image message
        await sendImageMessage(imageFile, message)
        setImageFile(null)
      } else {
        // Send text message
        await sendMessage(
          message, 
          'text', 
          null, 
          replyingTo ? replyingTo.id : null
        )
      }
      setReplyingTo(null)
      clearTypingIndicator()
    } catch (error) {
      console.error('Failed to send message:', error)
      setShowErrorModal({
        title: 'Message Failed',
        message: 'Could not send your message. Please try again.'
      })
    }
  }

  // Handle typing indicator
  const handleTyping = () => {
    if (selectedChat) {
      setTypingIndicator(selectedChat.id)
    }
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      setShowErrorModal({
        title: 'Invalid File',
        message: 'Only images are supported at this time.',
      })
      return
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setShowErrorModal({
        title: 'File Too Large',
        message: 'Images must be less than 10MB.',
      })
      return
    }
    
    setImageFile(file)
    setImagePreview(file)
  }

  // Handle removing selected image
  const handleRemoveImage = () => {
    setImageFile(null)
    clearImagePreview()
  }

  // Handle message edit
  const handleEditMessage = async () => {
    if (!editingMessage || !editingMessage.id || !newMessage.trim()) return

    try {
      await editMessage(editingMessage.id, newMessage)
      setEditingMessage(null)
      setNewMessage('')
    } catch (error) {
      console.error('Failed to edit message:', error)
      setShowErrorModal({
        title: 'Edit Failed',
        message: 'Could not edit your message. Please try again.'
      })
    }
  }

  // Start editing a message
  const startEditMessage = (message) => {
    if (message.sender_id !== user.id) return
    setEditingMessage(message)
    setNewMessage(message.content)
    setShowOptions(null)
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingMessage(null)
    setNewMessage('')
  }

  // Handle message deletion with confirmation
  const handleConfirmDeleteMessage = async () => {
    if (!showDeleteConfirm) return
    
    try {
      await deleteMessage(showDeleteConfirm)
      setShowDeleteConfirm(null)
      setShowOptions(null)
    } catch (error) {
      console.error('Failed to delete message:', error)
      setShowErrorModal({
        title: 'Delete Failed',
        message: 'Could not delete this message. Please try again.'
      })
    }
  }

  // Start a new conversation
  const handleStartNewConversation = async (userId) => {
    try {
      const conversationId = await getOrCreateDirectConversation(userId)
      if (conversationId) {
        const conversation = conversations.find(c => c.id === conversationId)
        setSelectedChat(conversation)
      }
      setShowNewChatModal(false)
    } catch (error) {
      console.error('Failed to start conversation:', error)
      setShowErrorModal({
        title: 'Connection Failed',
        message: 'Could not start a new conversation. Please try again.'
      })
    }
  }
  
  // Show image preview
  const handleImageClick = (imageUrl) => {
    if (!imageUrl) return
    setPreviewImage({
      isOpen: true,
      url: imageUrl
    })
  }
  
  // Close image preview
  const handleCloseImagePreview = () => {
    setPreviewImage({
      isOpen: false,
      url: null
    })
  }
  
  // Open new chat modal and fetch users
  const handleOpenNewChat = () => {
    setShowNewChatModal(true)
    fetchUsers()
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {!selectedChat ? (
        // Chat List View
        <ChatList
          conversations={filteredConversations}
          loading={conversationsLoading}
          error={conversationsError}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onChatSelect={setSelectedChat}
          onNewChat={handleOpenNewChat}
          onBack={() => navigate('/')}
        />
      ) : (
        // Chat View
        <ConversationView
          chat={selectedChat}
          messages={messages}
          loading={messagesLoading}
          error={messagesError}
          userId={user?.id}
          sendingState={{ sending }}
          imageUpload={imageUpload}
          replyingTo={replyingTo}
          editingMessage={editingMessage}
          onBack={() => {
            setSelectedChat(null)
            setNewMessage('')
            setReplyingTo(null)
            setEditingMessage(null)
            setImageFile(null)
            clearImagePreview()
          }}
          onSendMessage={handleSendMessage}
          onImageSelect={handleFileSelect}
          onImageRemove={handleRemoveImage}
          onTyping={handleTyping}
          onReply={setReplyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onEdit={startEditMessage}
          onCancelEdit={cancelEdit}
          onDelete={setShowDeleteConfirm}
          onImageClick={handleImageClick}
        />
      )}

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onStartConversation={handleStartNewConversation}
        suggestedUsers={suggestedUsers}
        filteredUsers={filteredUsers}
        searchQuery={userSearchQuery}
        onSearchChange={handleUserSearchChange}
        isLoading={isLoadingUsers}
        error={userSearchError}
        onRefresh={fetchUsers}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!showDeleteConfirm}
        message={showDeleteConfirm}
        onConfirm={handleConfirmDeleteMessage}
        onCancel={() => setShowDeleteConfirm(null)}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={!!showErrorModal}
        title={showErrorModal?.title}
        message={showErrorModal?.message}
        onClose={() => setShowErrorModal(null)}
      />
      
      {/* Image Preview Modal */}
      <ImagePreview
        isOpen={previewImage.isOpen}
        imageUrl={previewImage.url}
        onClose={handleCloseImagePreview}
      />
    </div>
  )
}

export default MessagesPage