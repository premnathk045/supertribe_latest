import { useState, useEffect, useCallback } from 'react'
import { 
  getDiscoveryData, 
  getSuggestedCreators, 
  searchDiscovery, 
  getCreatorsByCategory,
  clearDiscoveryCache 
} from '../lib/discovery'

export const useDiscovery = () => {
  const [data, setData] = useState({
    categories: [],
    trending_hashtags: [],
    suggested_creators: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDiscoveryData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const discoveryData = await getDiscoveryData()
      setData(discoveryData)
    } catch (err) {
      console.error('Error fetching discovery data:', err)
      setError(err.message || 'Failed to load discovery data')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    clearDiscoveryCache()
    fetchDiscoveryData()
  }, [fetchDiscoveryData])

  useEffect(() => {
    fetchDiscoveryData()
  }, [fetchDiscoveryData])

  return {
    data,
    loading,
    error,
    refreshData,
    refetch: fetchDiscoveryData
  }
}

export const useCreatorSearch = () => {
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchCreators = useCallback(async (query, options = {}) => {
    if (!query || query.trim().length < 2) {
      setCreators([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const results = await searchDiscovery(query, { ...options, type: 'creators' })
      setCreators(results.creators || [])
    } catch (err) {
      console.error('Error searching creators:', err)
      setError(err.message || 'Failed to search creators')
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setCreators([])
    setError(null)
  }, [])

  return {
    creators,
    loading,
    error,
    searchCreators,
    clearResults
  }
}

export const useCategoryCreators = (categorySlug) => {
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)

  const fetchCreators = useCallback(async (reset = false) => {
    if (!categorySlug) return

    try {
      setLoading(true)
      setError(null)
      
      const offset = reset ? 0 : creators.length
      const newCreators = await getCreatorsByCategory(categorySlug, { 
        limit: 20, 
        offset 
      })
      
      if (reset) {
        setCreators(newCreators)
      } else {
        setCreators(prev => [...prev, ...newCreators])
      }
      
      setHasMore(newCreators.length === 20)
    } catch (err) {
      console.error('Error fetching category creators:', err)
      setError(err.message || 'Failed to load creators')
    } finally {
      setLoading(false)
    }
  }, [categorySlug, creators.length])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchCreators(false)
    }
  }, [loading, hasMore, fetchCreators])

  const refresh = useCallback(() => {
    fetchCreators(true)
  }, [fetchCreators])

  useEffect(() => {
    if (categorySlug) {
      fetchCreators(true)
    } else {
      setCreators([])
      setError(null)
    }
  }, [categorySlug])

  return {
    creators,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  }
}

export const useGlobalSearch = () => {
  const [results, setResults] = useState({
    creators: [],
    hashtags: [],
    categories: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = useCallback(async (query, options = {}) => {
    if (!query || query.trim().length < 2) {
      setResults({ creators: [], hashtags: [], categories: [] })
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const searchResults = await searchDiscovery(query, options)
      setResults(searchResults)
    } catch (err) {
      console.error('Error performing global search:', err)
      setError(err.message || 'Failed to search')
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults({ creators: [], hashtags: [], categories: [] })
    setError(null)
  }, [])

  return {
    results,
    loading,
    error,
    search,
    clearResults
  }
}