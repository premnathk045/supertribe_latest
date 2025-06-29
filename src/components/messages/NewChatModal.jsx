import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiSearch, FiUsers } from 'react-icons/fi'
import LoadingSpinner from '../UI/LoadingSpinner'
import VerifiedBadge from '../VerifiedBadge'

function NewChatModal({ 
  isOpen, 
  onClose, 
  onStartConversation,
  suggestedUsers,
  filteredUsers,
  searchQuery,
  onSearchChange,
  isLoading,
  error,
  onRefresh
}) {
  // Function to get status color (placeholder - would come from presence hook)
  const getStatusColor = (userId) => {
    // This would ideally check actual online status
    return 'bg-gray-400'
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">New Message</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl text-gray-600" />
              </button>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-gray-100">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e)}
                  placeholder="Search by name or username..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* User List */}
            <div className="max-h-96 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-2">{error}</p>
                  <button
                    onClick={onRefresh}
                    className="text-primary-500 hover:text-primary-600 font-medium"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      {searchQuery ? 'Search Results' : 'Suggested Users'}
                    </h3>
                    {!searchQuery && filteredUsers.length >= 10 && (
                      <button 
                        onClick={onRefresh}
                        className="text-primary-500 text-sm font-medium"
                      >
                        Refresh
                      </button>
                    )}
                  </div>

                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No users found
                      </h3>
                      <p className="text-gray-600">
                        Try searching with a different term
                      </p>
                    </div>
                  ) : (
                    filteredUsers.map((userProfile) => (
                      <motion.div
                        key={userProfile.id}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onStartConversation(userProfile.id)}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                      >
                        <div className="relative">
                          <img
                            src={userProfile.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                            alt={userProfile.display_name || userProfile.username}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
                            }}
                          />
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${
                            getStatusColor(userProfile.id)
                          } border-2 border-white rounded-full`}></div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-1">
                            <h4 className="font-medium text-gray-900">{userProfile.display_name || userProfile.username || 'User'}</h4>
                            {userProfile.is_verified && (
                              <VerifiedBadge size="sm" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {userProfile.username ? `@${userProfile.username}` : 'No username'}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Create Group Chat */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <FiUsers className="text-gray-700" />
                  <span className="font-medium text-gray-800">Create Group Chat</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NewChatModal