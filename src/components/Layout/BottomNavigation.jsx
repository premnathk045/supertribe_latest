import { NavLink, useLocation } from 'react-router-dom'
import { FiHome, FiSearch, FiPlusSquare, FiUser, FiMessageCircle } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useConversations } from '../../hooks/useConversations'

function BottomNavigation() {
  const location = useLocation()
  const { userProfile, isCreator } = useAuth()
  const { conversations } = useConversations()
  
  // Calculate total unread messages
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/discover', icon: FiSearch, label: 'Discover' },
    ...(isCreator() ? [{ path: '/create', icon: FiPlusSquare, label: 'Create' }] : []),
    { path: '/messages', icon: FiMessageCircle, label: 'Messages' },
    { path: `/profile/${userProfile?.username || 'profile'}`, icon: FiUser, label: 'Profile' }
  ]

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 bottom-nav-safe"
    >
      <div className="max-w-lg mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path
            
            return (
              <NavLink
                key={path}
                to={path}
                className="flex flex-col items-center py-2 px-3 relative"
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Icon 
                    className={`text-2xl ${
                      isActive ? 'text-primary-500' : 'text-gray-600'
                    } transition-colors`} 
                  />
                  {/* Notification badge for messages */}
                  {path === '/messages' && (
                    totalUnread > 0 && (
                      <div className="absolute -top-1 -right-1 flex items-center justify-center">
                        <div className={`${totalUnread > 9 ? 'w-5 h-5 text-xs' : 'w-4 h-4 text-xs'} bg-primary-500 rounded-full flex items-center justify-center text-white font-bold`}>
                          {totalUnread > 99 ? '99+' : totalUnread}
                        </div>
                      </div>
                    )
                  )}

                </motion.div>
                <span className={`text-xs mt-1 ${
                  isActive ? 'text-primary-500' : 'text-gray-600'
                } transition-colors`}>
                  {label}
                </span>
              </NavLink>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}

export default BottomNavigation