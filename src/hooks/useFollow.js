import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useFollow = (profileId) => {
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  const [subscriptions, setSubscriptions] = useState([])

  // Check if current user follows the profile
  const checkFollowStatus = useCallback(async () => {
    if (!user || !profileId) return
    
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('followers')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', profileId)
        .single()
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error)
        setError('Failed to check follow status')
        return
      }
      
      setIsFollowing(!!data)
    } catch (err) {
      console.error('Error checking follow status:', err)
      setError('Failed to check follow status')
    } finally {
      setLoading(false)
    }
  }, [user, profileId])

  // Get follower and following counts
  const getFollowCounts = useCallback(async () => {
    if (!profileId) return
    
    try {
      // Get follower count
      const { data: followerData, error: followerError } = await supabase
        .rpc('get_follower_count', { profile_id: profileId })
        
      if (followerError) {
        console.error('Error fetching follower count:', followerError)
      } else {
        setFollowerCount(followerData)
      }
      
      // Get following count
      const { data: followingData, error: followingError } = await supabase
        .rpc('get_following_count', { profile_id: profileId })
        
      if (followingError) {
        console.error('Error fetching following count:', followingError)
      } else {
        setFollowingCount(followingData)
      }
    } catch (err) {
      console.error('Error fetching follow counts:', err)
    }
  }, [profileId])

  // Follow the profile
  const followProfile = async () => {
    if (!user || !profileId) return
    
    try {
      setActionLoading(true)
      setError(null)
      
      // Optimistically update UI
      setIsFollowing(true)
      setFollowerCount(prev => prev + 1)
      
      // Insert into followers table
      const { error } = await supabase
        .from('followers')
        .insert({ 
          follower_id: user.id,
          following_id: profileId
        })
        
      if (error) {
        // Revert optimistic update
        setIsFollowing(false)
        setFollowerCount(prev => prev - 1)
        
        console.error('Error following user:', error)
        setError('Failed to follow user')
        throw error
      }
      
    } catch (err) {
      console.error('Error following user:', err)
    } finally {
      setActionLoading(false)
    }
  }

  // Unfollow the profile
  const unfollowProfile = async () => {
    if (!user || !profileId) return
    
    try {
      setActionLoading(true)
      setError(null)
      
      // Optimistically update UI
      setIsFollowing(false)
      setFollowerCount(prev => prev - 1)
      
      // Delete from followers table
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profileId)
        
      if (error) {
        // Revert optimistic update
        setIsFollowing(true)
        setFollowerCount(prev => prev + 1)
        
        console.error('Error unfollowing user:', error)
        setError('Failed to unfollow user')
        throw error
      }
      
    } catch (err) {
      console.error('Error unfollowing user:', err)
    } finally {
      setActionLoading(false)
    }
  }

  // Toggle follow status
  const toggleFollow = async () => {
    if (isFollowing) {
      await unfollowProfile()
    } else {
      await followProfile()
    }
  }

  // Set up real-time subscriptions
  useEffect(() => {
    if (!profileId) return
    
    const setupSubscriptions = async () => {
      // Subscribe to followers changes
      const followersSubscription = supabase
        .channel('followers-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `following_id=eq.${profileId}`
        }, () => {
          getFollowCounts()
          checkFollowStatus()
        })
        .subscribe()

      // Store subscriptions for cleanup
      setSubscriptions([followersSubscription])
    }
    
    setupSubscriptions()
    
    // Cleanup subscriptions
    return () => {
      subscriptions.forEach(subscription => {
        supabase.removeChannel(subscription)
      })
    }
  }, [profileId, checkFollowStatus, getFollowCounts])

  // Initial data fetch
  useEffect(() => {
    checkFollowStatus()
    getFollowCounts()
  }, [checkFollowStatus, getFollowCounts, user, profileId])

  return {
    isFollowing,
    followerCount,
    followingCount,
    loading,
    actionLoading,
    error,
    followProfile,
    unfollowProfile,
    toggleFollow,
    refreshCounts: getFollowCounts
  }
}

export default useFollow