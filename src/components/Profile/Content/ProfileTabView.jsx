import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiGrid, FiList, FiFilter } from 'react-icons/fi'
import ContentGrid from './ContentGrid'
import PostsList from './PostsList'
import SortOptionsSheet from './SortOptionsSheet'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../UI/LoadingSpinner'

const SORT_OPTIONS = [
  { id: 'latest', label: 'Latest' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'commented', label: 'Most Commented' }
]

function ProfileTabView({ profileData, userPosts, loading, error }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('posts')
  const [viewMode, setViewMode] = useState('grid')
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])
  const [showSortOptions, setShowSortOptions] = useState(false)

  // Sort posts based on selected option
  const getSortedPosts = () => {
    if (!userPosts) return []
    
    const posts = [...userPosts]
    
    switch (sortOption.id) {
      case 'popular':
        return posts.sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
      case 'commented':
        return posts.sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0))
      case 'latest':
      default:
        return posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
  }

  const sortedPosts = getSortedPosts()

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }
  
  // Handle sort option selection
  const handleSortSelect = (option) => {
    setSortOption(option)
    setShowSortOptions(false)
  }

  return (
    <div className="flex flex-col">
      {/* Tabs */}
      <div className="flex border-t border-gray-200">
        <button
          onClick={() => handleTabChange('posts')}
          className={`flex-1 py-3 flex items-center justify-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'posts'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiList className="text-lg" />
          <span className="font-medium">Posts</span>
        </button>
        <button
          onClick={() => handleTabChange('media')}
          className={`flex-1 py-3 flex items-center justify-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'media'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiGrid className="text-lg" />
          <span className="font-medium">Media</span>
        </button>
      </div>

      {/* Action Bar */}
      <div className="py-3 px-4 flex items-center justify-between bg-gray-50 border-b border-gray-200">
        <div className="text-sm text-gray-500">
          {loading ? (
            <span>Loading...</span>
          ) : (
            <span>{sortedPosts.length} {activeTab}</span>
          )}
        </div>
        
        {activeTab === 'posts' && (
          <button
            onClick={() => setShowSortOptions(true)}
            className="flex items-center space-x-1 text-sm text-gray-700 bg-white px-3 py-1 rounded-full border border-gray-300 shadow-sm"
          >
            <FiFilter className="text-gray-500" size={14} />
            <span>{sortOption.label}</span>
          </button>
        )}
        
        {activeTab === 'media' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-200'
              }`}
            >
              <FiGrid size={16} className={viewMode === 'grid' ? 'text-primary-500' : 'text-gray-600'} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${
                viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-200'
              }`}
            >
              <FiList size={16} className={viewMode === 'list' ? 'text-primary-500' : 'text-gray-600'} />
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-grow">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button className="text-primary-500 hover:text-primary-600 font-medium">
                Retry
              </button>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {activeTab === 'posts' ? (
                sortedPosts.length > 0 ? (
                  <PostsList 
                    posts={sortedPosts}
                    profileData={profileData || {}}
                  />
                ) : (
                  <div className="py-16 text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No posts yet
                    </h3>
                    <p className="text-gray-500">
                      This user hasn't shared any posts yet
                    </p>
                  </div>
                )
              ) : (
                <div className="p-4">
                  <ContentGrid 
                    activeTab="media"
                    posts={[sortedPosts.filter(post => post.media_urls && post.media_urls.length > 0), [], []]}
                    loading={false}
                    error={null}
                    onPostClick={(post) => navigate(`/post/${post.id}`)}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sort Options Sheet */}
      <SortOptionsSheet 
        isOpen={showSortOptions}
        onClose={() => setShowSortOptions(false)}
        options={SORT_OPTIONS}
        selectedOption={sortOption}
        onSelect={handleSortSelect}
      />
    </div>
  )
}

export default ProfileTabView