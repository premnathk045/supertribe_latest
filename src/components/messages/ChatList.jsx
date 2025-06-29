import { motion } from 'framer-motion'
import { FiSearch, FiPlus, FiArrowLeft } from 'react-icons/fi'
import ChatListItem from './ChatListItem'
import LoadingSpinner from '../UI/LoadingSpinner'

function ChatList({ 
  conversations, 
  loading, 
  error, 
  searchQuery, 
  onSearchChange,
  onChatSelect, 
  onNewChat, 
  onBack 
}) {
  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-semibold">Messages</h1>
          <button
            onClick={onNewChat}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiPlus className="text-xl" />
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-2">Failed to load conversations</p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              Try again
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No matching conversations' : 'No conversations yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Start a conversation with someone'}
            </p>
            <button
              onClick={onNewChat}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <FiPlus className="mr-2" />
              New Message
            </button>
          </div>
        ) : (
          <div className="max-w-lg mx-auto">
            {conversations.map((chat, index) => (
              <ChatListItem 
                key={chat.id} 
                chat={chat} 
                index={index}
                onClick={() => onChatSelect(chat)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default ChatList