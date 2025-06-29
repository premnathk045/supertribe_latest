import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useCreatorAccess = (postId) => {
  const { user } = useAuth()
  const [isCreator, setIsCreator] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if the current user is the creator of the post
  const checkCreatorAccess = useCallback(async () => {
    if (!user || !postId) {
      setIsCreator(false)
      setLoading(false)
      return false
    }

    try {
      setLoading(true)
      setError(null)

      // Query the post to check if the current user is the creator
      const { data, error } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single()

      if (error) throw error

      const userIsCreator = data && data.user_id === user.id
      setIsCreator(userIsCreator)
      return userIsCreator
    } catch (err) {
      console.error('Error checking creator access:', err)
      setError(err.message || 'Failed to check creator access')
      return false
    } finally {
      setLoading(false)
    }
  }, [user, postId])

  // Run the check when the component mounts or when user/postId changes
  useEffect(() => {
    checkCreatorAccess()
  }, [checkCreatorAccess])

  return {
    isCreator,
    loading,
    error,
    checkCreatorAccess
  }
}

export default useCreatorAccess