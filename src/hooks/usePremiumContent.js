import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import usePaymentMethods from './usePaymentMethods'
import useCreatorAccess from './useCreatorAccess'

export const usePremiumContent = (postId) => {
  const { user } = useAuth()
  const { hasPaymentMethod, fetchPaymentMethods } = usePaymentMethods()
  const { isCreator } = useCreatorAccess(postId)
  const [unlocking, setUnlocking] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [error, setError] = useState(null)
  const [hasPurchased, setHasPurchased] = useState(false)

  // Check if user has already purchased the content
  const checkPurchaseStatus = useCallback(async (postId) => {
    if (!user || !postId) return false
    
    try {
      const { data, error } = await supabase
        .from('content_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking purchase status:', error)
        return false
      }
      
      const purchased = !!data
      setHasPurchased(purchased)
      return purchased
    } catch (err) {
      console.error('Error checking purchase status:', err)
      return false
    }
  }, [user])

  // Check purchase status when postId changes
  useEffect(() => {
    if (postId) {
      checkPurchaseStatus(postId)
    }
  }, [postId, checkPurchaseStatus])

  // Verify payment method before unlocking content
  const verifyPaymentMethod = useCallback(async () => {
    if (!user) return false
    
    try {
      // Refresh payment methods to ensure we have the latest data
      await fetchPaymentMethods()
      
      return hasPaymentMethod
    } catch (err) {
      console.error('Error verifying payment method:', err)
      return false
    }
  }, [user, hasPaymentMethod, fetchPaymentMethods])

  // Unlock premium content
  const unlockContent = useCallback(async (postId, price) => {
    if (!user) return { success: false, error: 'Authentication required' }

    // If user is the creator, they can access their own content without payment
    if (isCreator) {
      return { success: true, isCreator: true }
    }
    
    setUnlocking(true)
    setError(null)
    
    try {
      // First verify payment method
      const hasPayment = await verifyPaymentMethod()
      
      if (!hasPayment) {
        setShowPaymentModal(true)
        return { success: false, error: 'No payment method found' }
      }
      
      // In a real app, this would process a payment
      // For demo purposes, we'll just record the purchase
      
      // Check if already purchased
      const { data: existingPurchase } = await supabase
        .from('content_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()
      
      if (existingPurchase) {
        return { success: true, alreadyPurchased: true }
      }
      
      // Record the purchase
      const { data, error } = await supabase
        .from('content_purchases')
        .insert({
          user_id: user.id,
          post_id: postId,
          amount: price,
          status: 'completed',
          payment_method_id: null // In a real app, this would be the payment method ID
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Create notification for the content creator
      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single()
      
      if (post) {
        await supabase
          .from('notifications')
          .insert({
            recipient_id: post.user_id,
            sender_id: user.id,
            type: 'purchase',
            content_id: postId,
            message: 'purchased your premium content',
            metadata: {
              post_id: postId,
              amount: price
            }
          })
      }
      
      return { success: true, purchase: data }
    } catch (err) {
      console.error('Error unlocking content:', err)
      setError(err.message || 'Failed to unlock content')
      return { success: false, error: err.message || 'Failed to unlock content' }
    } finally {
      setUnlocking(false)
    }
  }, [user, verifyPaymentMethod])

  return {
    unlockContent,
    unlocking,
    showPaymentModal,
    setShowPaymentModal,
    error,
    hasPaymentMethod,
    verifyPaymentMethod,
    isCreator,
    hasPurchased,
    checkPurchaseStatus
  }
}

export default usePremiumContent