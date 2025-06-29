import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCheck } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import VerificationProgressBar from '../components/CreatorVerification/VerificationProgressBar'
import PersonalInfoForm from '../components/CreatorVerification/PersonalInfoForm'
import AgeVerification from '../components/CreatorVerification/AgeVerification'
import ProfileSetup from '../components/CreatorVerification/ProfileSetup'
import PaymentSetup from '../components/CreatorVerification/PaymentSetup'
import LoadingSpinner from '../components/UI/LoadingSpinner'

function CreatorVerificationPage() {
  const navigate = useNavigate()
  const { user, userProfile, updateUserProfile, refreshUserProfile } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [verificationData, setVerificationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }

    fetchVerificationData()
  }, [user])

  const fetchVerificationData = async () => {
    try {
      const { data, error } = await supabase
        .from('creator_verifications')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching verification data:', error)
      }

      if (data) {
        setVerificationData(data)
        // Determine current step based on completion status
        if (!data.full_name || !data.email || !data.city || !data.country) {
          setCurrentStep(1)
        } else if (!data.age_verified) {
          setCurrentStep(2)
        } else if (!data.profile_completed) {
          setCurrentStep(3)
        } else if (!data.payment_setup_completed) {
          setCurrentStep(4)
        } else {
          // All steps completed, check status
          if (data.status === 'approved') {
            navigate('/creator-dashboard')
          } else {
            setCurrentStep(5) // Pending approval
          }
        }
      }
    } catch (error) {
      console.error('Error fetching verification data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createOrUpdateVerification = async (updates) => {
    try {
      if (verificationData) {
        // Update existing record
        const { data, error } = await supabase
          .from('creator_verifications')
          .update(updates)
          .eq('id', verificationData.id)
          .select()
          .single()

        if (error) throw error
        setVerificationData(data)
        return data
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('creator_verifications')
          .insert({
            user_id: user.id,
            email: user.email,
            ...updates
          })
          .select()
          .single()

        if (error) throw error
        setVerificationData(data)
        return data
      }
    } catch (error) {
      console.error('Error updating verification:', error)
      throw error
    }
  }

  const handleStepComplete = async (stepData) => {
    setSubmitting(true)
    
    try {
      switch (currentStep) {
        case 1:
          await createOrUpdateVerification(stepData)
          setCurrentStep(2)
          break
        case 2:
          await createOrUpdateVerification({
            age_verified: true,
            age_verification_date: new Date().toISOString()
          })
          setCurrentStep(3)
          break
        case 3:
          await createOrUpdateVerification({
            profile_completed: true,
            profile_completion_date: new Date().toISOString()
          })
          // Also update the profiles table
          await updateUserProfile(stepData)
          setCurrentStep(4)
          break
        case 4:
          // Create demo payment method
          await supabase
            .from('payment_methods')
            .insert({
              user_id: user.id,
              type: 'demo_card',
              card_last_four: '1234',
              card_brand: 'Visa',
              is_default: true,
              is_demo: true
            })

          await createOrUpdateVerification({
            payment_setup_completed: true,
            payment_setup_date: new Date().toISOString(),
            submitted_at: new Date().toISOString()
          })

          // Auto-approve for demo purposes
          setTimeout(async () => {
            await createOrUpdateVerification({
              status: 'approved',
              approved_at: new Date().toISOString()
            })

            await updateUserProfile({
              user_type: 'creator',
              is_verified: true
            })

            // Refresh the user profile to update the context
            await refreshUserProfile()

            navigate('/creator-dashboard')
          }, 2000)

          setCurrentStep(5)
          break
      }
    } catch (error) {
      console.error('Error completing step:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoForm
            initialData={verificationData}
            onComplete={handleStepComplete}
            loading={submitting}
          />
        )
      case 2:
        return (
          <AgeVerification
            onComplete={handleStepComplete}
            loading={submitting}
          />
        )
      case 3:
        return (
          <ProfileSetup
            initialData={userProfile}
            onComplete={handleStepComplete}
            loading={submitting}
          />
        )
      case 4:
        return (
          <PaymentSetup
            onComplete={handleStepComplete}
            loading={submitting}
          />
        )
      case 5:
        return (
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FiCheck className="text-3xl text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Application Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Your creator verification application has been submitted. 
              We'll review it and get back to you within 24-48 hours.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Continue to Home
            </button>
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          
          <h1 className="text-lg font-semibold">Creator Verification</h1>
          
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* Progress Bar */}
        <VerificationProgressBar currentStep={currentStep} totalSteps={4} />

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8"
        >
          {renderCurrentStep()}
        </motion.div>
      </div>
    </div>
  )
}

export default CreatorVerificationPage