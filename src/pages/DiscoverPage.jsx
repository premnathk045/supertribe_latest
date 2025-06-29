import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiGrid, FiList, FiTrendingUp, FiRefreshCw, FiWifi, FiWifiOff } from 'react-icons/fi'
import SearchBar from '../components/Discover/SearchBar'
import CategoryGrid from '../components/Discover/CategoryGrid'
import TrendingSection from '../components/Discover/TrendingSection'
import CreatorGrid from '../components/Discover/CreatorGrid'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { useDiscovery, useCreatorSearch, useCategoryCreators, useGlobalSearch } from '../hooks/useDiscovery'

function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchType, setSearchType] = useState('all') // 'all', 'creators', 'hashtags'

  // Main discovery data
  const { data: discoveryData, loading: discoveryLoading, error: discoveryError, refreshData } = useDiscovery()

  // Search functionality
  const { results: searchResults, loading: searchLoading, search, clearResults } = useGlobalSearch()
  const { creators: searchCreatorResults, loading: creatorSearchLoading, searchCreators } = useCreatorSearch()

  // Category-specific creators
  const { 
    creators: categoryCreators, 
    loading: categoryLoading, 
    error: categoryError,
    hasMore: categoryHasMore,
    loadMore: loadMoreCategoryCreators,
    refresh: refreshCategoryCreators
  } = useCategoryCreators(selectedCategory?.slug)

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        if (searchType === 'creators') {
          searchCreators(searchQuery)
        } else {
          search(searchQuery, { type: searchType })
        }
      } else {
        clearResults()
      }
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchType, search, searchCreators, clearResults])

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setSearchQuery('') // Clear search when selecting category
    clearResults()
  }

  // Handle search clear
  const handleSearchClear = () => {
    setSearchQuery('')
    setSelectedCategory(null)
    clearResults()
  }

  // Get current creators to display
  const getCurrentCreators = () => {
    if (searchQuery.trim().length >= 2) {
      if (searchType === 'creators') {
        return searchCreatorResults
      }
      return searchResults.creators || []
    }
    
    if (selectedCategory) {
      return categoryCreators
    }
    
    return discoveryData.suggested_creators || []
  }

  // Get current loading state
  const getCurrentLoading = () => {
    if (searchQuery.trim().length >= 2) {
      return searchType === 'creators' ? creatorSearchLoading : searchLoading
    }
    
    if (selectedCategory) {
      return categoryLoading
    }
    
    return discoveryLoading
  }

  // Handle retry for errors
  const handleRetry = () => {
    if (selectedCategory) {
      refreshCategoryCreators()
    } else {
      refreshData()
    }
  }

  const currentCreators = getCurrentCreators()
  const currentLoading = getCurrentLoading()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-lg mx-auto">
        {/* Search Header */}
        <div className="bg-white p-4 border-b border-gray-200 sticky top-16 z-30">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search creators, content..."
          />
          
          {/* Search Type Filters */}
          {searchQuery.trim().length >= 2 && (
            <div className="flex items-center space-x-2 mt-3">
              {['all', 'creators', 'hashtags'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSearchType(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    searchType === type
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {searchQuery.trim().length >= 2 
                  ? `Search Results` 
                  : selectedCategory 
                  ? selectedCategory.name 
                  : 'Discover'
                }
              </h2>
              
              {/* Clear button */}
              {(searchQuery.trim().length >= 2 || selectedCategory) && (
                <button
                  onClick={handleSearchClear}
                  className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                >
                  Clear
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Refresh button */}
              <button
                onClick={handleRetry}
                disabled={currentLoading}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
              >
                <FiRefreshCw className={`text-lg ${currentLoading ? 'animate-spin' : ''}`} />
              </button>
              
              {/* View mode toggle */}
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'
                }`}
              >
                <FiGrid className="text-lg" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'
                }`}
              >
                <FiList className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {(discoveryError || categoryError) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center space-x-2 text-red-700">
              <FiWifiOff className="text-lg" />
              <p className="text-sm font-medium">
                {discoveryError || categoryError}
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Try again
            </button>
          </motion.div>
        )}

        {/* Content */}
        <div className="space-y-6 p-4">
          {/* Default Discovery Content */}
          {!searchQuery.trim() && !selectedCategory && (
            <>
              {/* Categories */}
              <motion.section
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                {discoveryLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="bg-gray-200 animate-pulse h-20 rounded-xl"></div>
                    ))}
                  </div>
                ) : (
                  <CategoryGrid 
                    categories={discoveryData.categories || []}
                    onCategorySelect={handleCategorySelect}
                  />
                )}
              </motion.section>

              {/* Trending */}
              <motion.section
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <FiTrendingUp className="text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Trending</h3>
                </div>
                {discoveryLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="bg-gray-200 animate-pulse h-16 rounded-xl"></div>
                    ))}
                  </div>
                ) : (
                  <TrendingSection tags={discoveryData.trending_hashtags || []} />
                )}
              </motion.section>

              {/* Suggested Creators */}
              <motion.section
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Creators</h3>
                {currentLoading ? (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
                    {Array.from({ length: viewMode === 'grid' ? 6 : 4 }).map((_, index) => (
                      <div key={index} className={`bg-gray-200 animate-pulse rounded-xl ${
                        viewMode === 'grid' ? 'h-48' : 'h-20'
                      }`}></div>
                    ))}
                  </div>
                ) : (
                  <CreatorGrid 
                    creators={currentCreators}
                    viewMode={viewMode}
                  />
                )}
              </motion.section>
            </>
          )}

          {/* Search Results */}
          {searchQuery.trim().length >= 2 && (
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              key="search-results"
            >
              <AnimatePresence mode="wait">
                {currentLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center py-8"
                  >
                    <LoadingSpinner size="lg" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Search Results Tabs */}
                    {searchType === 'all' && (
                      <div className="space-y-6">
                        {/* Creators Results */}
                        {searchResults.creators && searchResults.creators.length > 0 && (
                          <div>
                            <h4 className="text-md font-semibold text-gray-900 mb-3">Creators</h4>
                            <CreatorGrid 
                              creators={searchResults.creators}
                              viewMode={viewMode}
                            />
                          </div>
                        )}

                        {/* Hashtags Results */}
                        {searchResults.hashtags && searchResults.hashtags.length > 0 && (
                          <div>
                            <h4 className="text-md font-semibold text-gray-900 mb-3">Hashtags</h4>
                            <div className="space-y-2">
                              {searchResults.hashtags.map((hashtag) => (
                                <div key={hashtag.tag} className="bg-white p-3 rounded-lg border border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900">#{hashtag.tag}</span>
                                    <span className="text-sm text-gray-500">{hashtag.usage_count} posts</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Categories Results */}
                        {searchResults.categories && searchResults.categories.length > 0 && (
                          <div>
                            <h4 className="text-md font-semibold text-gray-900 mb-3">Categories</h4>
                            <CategoryGrid 
                              categories={searchResults.categories}
                              onCategorySelect={handleCategorySelect}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Single type results */}
                    {searchType !== 'all' && (
                      <div>
                        {searchType === 'creators' && (
                          <CreatorGrid 
                            creators={currentCreators}
                            viewMode={viewMode}
                          />
                        )}
                        
                        {searchType === 'hashtags' && searchResults.hashtags && (
                          <div className="space-y-2">
                            {searchResults.hashtags.map((hashtag) => (
                              <div key={hashtag.tag} className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-900">#{hashtag.tag}</span>
                                  <span className="text-sm text-gray-500">{hashtag.usage_count} posts</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* No Results */}
                    {!currentLoading && currentCreators.length === 0 && 
                     (!searchResults.hashtags || searchResults.hashtags.length === 0) &&
                     (!searchResults.categories || searchResults.categories.length === 0) && (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No results found
                        </h3>
                        <p className="text-gray-600">
                          Try searching with different keywords
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}

          {/* Category Results */}
          {selectedCategory && !searchQuery.trim() && (
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              key="category-results"
            >
              <AnimatePresence mode="wait">
                {currentLoading && categoryCreators.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center py-8"
                  >
                    <LoadingSpinner size="lg" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <CreatorGrid 
                      creators={currentCreators}
                      viewMode={viewMode}
                    />
                    
                    {/* Load More Button */}
                    {categoryHasMore && (
                      <div className="text-center mt-6">
                        <button
                          onClick={loadMoreCategoryCreators}
                          disabled={currentLoading}
                          className="bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 mx-auto"
                        >
                          {currentLoading ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <span>Load More</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* No Results */}
                    {!currentLoading && currentCreators.length === 0 && (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No creators found
                        </h3>
                        <p className="text-gray-600">
                          No verified creators in this category yet
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default DiscoverPage