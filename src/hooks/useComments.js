import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useComments = (postId) => {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch comments for the post
  const fetchComments = useCallback(async () => {
    if (!postId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setComments(data || [])
    } catch (err) {
      console.error('Error fetching comments:', err)
      setError('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }, [postId])

  // Add a new comment
  const addComment = useCallback(async (content) => {
    if (!user || !postId || !content.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      // Optimistic update
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
        profiles: {
          username: user.user_metadata?.username || 'user',
          display_name: user.user_metadata?.full_name || 'User',
          avatar_url: user.user_metadata?.avatar_url || null,
          is_verified: false
        },
        isOptimistic: true
      }

      setComments(prev => [...prev, optimisticComment])

      // Insert into database
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim()
        })
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `)
        .single()

      if (error) throw error

      // Replace optimistic comment with real one
      setComments(prev => 
        prev.map(comment => 
          comment.id === optimisticComment.id ? data : comment
        )
      )

      return data
    } catch (err) {
      console.error('Error adding comment:', err)
      setError('Failed to add comment')
      
      // Remove optimistic comment on error
      setComments(prev => 
        prev.filter(comment => comment.id !== `temp-${Date.now()}`)
      )
      
      throw err
    } finally {
      setSubmitting(false)
    }
  }, [user, postId])

  // Delete a comment
  const deleteComment = useCallback(async (commentId) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id) // Ensure user can only delete their own comments

      if (error) throw error

      setComments(prev => prev.filter(comment => comment.id !== commentId))
    } catch (err) {
      console.error('Error deleting comment:', err)
      setError('Failed to delete comment')
      throw err
    }
  }, [user])

  // Set up real-time subscription
  useEffect(() => {
    if (!postId) return

    fetchComments()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`
        },
        async (payload) => {
          console.log('New comment received:', payload)
          
          // Fetch the complete comment with user profile
          const { data, error } = await supabase
            .from('post_comments')
            .select(`
              *,
              profiles:user_id (
                username,
                display_name,
                avatar_url,
                is_verified
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && data) {
            setComments(prev => {
              // Check if comment already exists (avoid duplicates from optimistic updates)
              const exists = prev.some(comment => comment.id === data.id)
              if (exists) return prev
              
              return [...prev, data]
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          console.log('Comment deleted:', payload)
          setComments(prev => prev.filter(comment => comment.id !== payload.old.id))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`
        },
        async (payload) => {
          console.log('Comment updated:', payload)
          
          // Fetch the updated comment with user profile
          const { data, error } = await supabase
            .from('post_comments')
            .select(`
              *,
              profiles:user_id (
                username,
                display_name,
                avatar_url,
                is_verified
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && data) {
            setComments(prev => 
              prev.map(comment => comment.id === data.id ? data : comment)
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [postId, fetchComments])

  return {
    comments,
    loading,
    error,
    submitting,
    addComment,
    deleteComment,
    refetch: fetchComments
  }
}