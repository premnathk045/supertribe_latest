import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const usePaymentMethods = () => {
  const { user } = useAuth()
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false)

  const fetchPaymentMethods = useCallback(async () => {
    if (!user) {
      setPaymentMethods([])
      setHasPaymentMethod(false)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setPaymentMethods(data || [])
      setHasPaymentMethod(data && data.length > 0)
    } catch (err) {
      console.error('Error fetching payment methods:', err)
      setError('Failed to load payment methods')
    } finally {
      setLoading(false)
    }
  }, [user])

  const addDemoPaymentMethod = useCallback(async (cardDetails) => {
    if (!user) return null

    try {
      setLoading(true)
      setError(null)

      // Create demo payment method
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          type: 'demo_card',
          card_last_four: cardDetails.cardNumber.slice(-4),
          card_brand: 'Visa',
          is_default: true,
          is_demo: true
        })
        .select()
        .single()

      if (error) throw error

      // Refresh payment methods
      await fetchPaymentMethods()
      
      return data
    } catch (err) {
      console.error('Error adding payment method:', err)
      setError('Failed to add payment method')
      return null
    } finally {
      setLoading(false)
    }
  }, [user, fetchPaymentMethods])

  const removePaymentMethod = useCallback(async (paymentMethodId) => {
    if (!user) return false

    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId)
        .eq('user_id', user.id)

      if (error) throw error

      // Refresh payment methods
      await fetchPaymentMethods()
      
      return true
    } catch (err) {
      console.error('Error removing payment method:', err)
      setError('Failed to remove payment method')
      return false
    } finally {
      setLoading(false)
    }
  }, [user, fetchPaymentMethods])

  // Initial fetch
  useEffect(() => {
    fetchPaymentMethods()
  }, [fetchPaymentMethods])

  return {
    paymentMethods,
    hasPaymentMethod,
    loading,
    error,
    fetchPaymentMethods,
    addDemoPaymentMethod,
    removePaymentMethod
  }
}

export default usePaymentMethods