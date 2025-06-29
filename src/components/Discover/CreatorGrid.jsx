import { motion } from 'framer-motion'
import { FiUserPlus } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import VerifiedBadge from '../VerifiedBadge'

function CreatorGrid({ creators, viewMode }) {
  // Add followerCounts state
  const [followerCounts, setFollowerCounts] = useState({})
  // Add postCounts state
  const [postCounts, setPostCounts] = useState({})

  useEffect(() => {
    let isMounted = true
    const fetchCounts = async () => {
      const counts = {}
      const posts = {}
      await Promise.all(
        creators.map(async (creator) => {
          try {
            // Fetch follower count
            const { data, error } = await supabase.rpc('get_follower_count', { profile_id: creator.id })
            if (!error && isMounted) {
              counts[creator.id] = data
            }
          } catch {
            // ignore error, fallback to 0
          }
          try {
            // Fetch post count
            const { count, error: postError } = await supabase
              .from('posts')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', creator.id)
            if (!postError && isMounted) {
              posts[creator.id] = count ?? 0
            }
          } catch {
            // ignore error, fallback to 0
          }
        })
      )
      if (isMounted) {
        setFollowerCounts(counts)
        setPostCounts(posts)
      }
    }
    if (creators.length > 0) fetchCounts()
    return () => { isMounted = false }
  }, [creators])

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {creators.map((creator, index) => (
          <motion.div
            key={creator.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Link to={`/user/${creator.username}`}>
                  <img
                    src={creator.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                    alt={creator.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </Link>
                <VerifiedBadge size="sm" className="flex-shrink-0" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <Link to={`/user/${creator.username}`} className="hover:underline">
                    <h4 className="font-semibold text-gray-900 truncate">{creator.displayName}</h4>
                  </Link>
                  {creator.isVerified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  {creator.isPremium && (
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
                <Link to={`/user/${creator.username}`} className="hover:underline">
                  <p className="text-sm text-gray-500 truncate">@{creator.username}</p>
                </Link>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{creator.bio}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>
                    {followerCounts[creator.id] !== undefined
                      ? followerCounts[creator.id].toLocaleString()
                      : '...'} followers
                  </span>
                  <span>
                    {postCounts[creator.id] !== undefined
                      ? postCounts[creator.id].toLocaleString()
                      : '...'} posts
                  </span>
                </div>
              </div>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <FiUserPlus className="text-sm" />
                <span>Follow</span>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {creators.map((creator, index) => (
        <motion.div
          key={creator.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -4 }}
          className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all text-center"
        >
          <Link to={`/user/${creator.username}`} className="relative inline-block mb-3">
            <img
              src={creator.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
              alt={creator.displayName}
              className="w-16 h-16 rounded-full object-cover mx-auto"
            />
            {creator.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </Link>
          
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Link to={`/user/${creator.username}`} className="hover:underline">
              <h4 className="font-semibold text-gray-900 truncate">{creator.displayName}</h4>
            </Link>
            {creator.isVerified && (
              <VerifiedBadge size="sm" />
            )}
            {creator.isPremium && (
              <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            )}
          </div>
          
          <Link to={`/user/${creator.username}`} className="hover:underline">
            <p className="text-sm text-gray-500 mb-2">@{creator.username}</p>
          </Link>
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{creator.bio}</p>
          
          <div className="text-xs text-gray-500 mb-3">
            <span className="font-medium">
              {followerCounts[creator.id] !== undefined
                ? followerCounts[creator.id].toLocaleString()
                : '...'}
            </span> followers
          </div>
          <div className="text-xs text-gray-500 mb-1">
            <span>
              {postCounts[creator.id] !== undefined
                ? postCounts[creator.id].toLocaleString()
                : '...'} posts
            </span>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-medium transition-colors"
          >
            Follow
          </motion.button>
        </motion.div>
      ))}
    </div>
  )
}

export default CreatorGrid