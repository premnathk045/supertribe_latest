import { FiArrowLeft, FiPhone, FiVideo, FiMoreVertical } from 'react-icons/fi'

function ChatHeader({ chat, onBack }) {
  const getStatusColor = (userId) => {
    // This would ideally come from a presence hook
    return chat.participants.length > 0 ? 'bg-green-500' : 'bg-gray-400'
  }
  
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div className="relative">
            <img
              src={chat.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
              alt={chat.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {chat.participants.length > 0 && (
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${
                getStatusColor(chat.participants[0].user_id)
              } border-2 border-white rounded-full`}></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{chat.name}</h2>
            <p className="text-sm text-gray-500">
              {chat.participants.length > 0 && (
                chat.participants[0]?.profiles?.user_type === 'online'
                  ? 'Active now'
                  : chat.participants[0]?.profiles?.user_type === 'away'
                  ? 'Away'
                  : 'Last seen recently'
              )}
              {chat.type === 'group' && `${chat.participants.length + 1} members`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiPhone className="text-xl text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiVideo className="text-xl text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiMoreVertical className="text-xl text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatHeader