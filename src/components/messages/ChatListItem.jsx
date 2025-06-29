import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import VerifiedBadge from '../VerifiedBadge'

function ChatListItem({ chat, index, onClick }) {
  const hasUnread = chat.unreadCount > 0

  const getStatusColor = (userId) => {
    // This would ideally come from a presence hook
    return chat.participants.length > 0 ? 'bg-green-500' : 'bg-gray-400'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`flex items-center space-x-4 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
        hasUnread ? 'bg-primary-50' : ''
      }`}
    >
      <div className="relative">
        <img
          src={chat.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
          alt={chat.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        {chat.participants.length > 0 && (
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${
            getStatusColor(chat.participants[0].user_id)
          } border-2 border-white rounded-full`}></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${hasUnread ? 'text-gray-900' : 'text-gray-700'} truncate`}>
            {chat.name}
          </h3>
          {chat.participants.length > 0 && chat.participants[0]?.profiles?.is_verified && (
            <VerifiedBadge size="xs" className="ml-1" />
          )}
          {chat.lastMessage && (
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(chat.lastMessage.createdAt, { addSuffix: true })}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          {chat.lastMessage ? (
            <p className={`text-sm truncate ${
              hasUnread ? 'text-gray-900 font-medium' : 'text-gray-600'
            }`}>
              {chat.lastMessage.isFromCurrentUser && 'You: '}
              {chat.lastMessage.messageType === 'image' ? '📷 Image' : chat.lastMessage.content}
            </p>
          ) : (
            <p className="text-sm text-gray-500 italic">No messages yet</p>
          )}
          {hasUnread && (
            <div className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ChatListItem