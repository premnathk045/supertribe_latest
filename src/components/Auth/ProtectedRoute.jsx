import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import AuthModal from './AuthModal'
import LoadingSpinner from '../UI/LoadingSpinner'

function ProtectedRoute({ children, requireAuth = true, requiredRole = null }) {
  const { user, userProfile, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      setShowAuthModal(true)
    }
  }, [user, loading, requireAuth])

  useEffect(() => {
    if (!loading && user && requiredRole) {
      const hasRequiredRole = checkUserRole(userProfile, requiredRole)
      if (!hasRequiredRole) {
        setShowUpgradeModal(true)
      }
    }
  }, [user, userProfile, loading, requiredRole])

  const checkUserRole = (profile, role) => {
    if (!profile) return false
    
    switch (role) {
      case 'creator':
        return profile.user_type === 'creator' && profile.is_verified === true
      case 'fan':
        return profile.user_type === 'fan' || profile.user_type === 'creator'
      default:
        return true
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (requireAuth && !user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Sign in required
            </h1>
            <p className="text-gray-600 mb-6">
              You need to be signed in to access this page.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="signin"
        />
      </>
    )
  }

  if (requiredRole && !checkUserRole(userProfile, requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">⭐</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Creator Access Required
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be a verified creator to access this feature.
          </p>
          <div className="space-y-3">
            <a
              href="/creator-verification"
              className="block bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Become a Creator
            </a>
            <a
              href="/"
              className="block text-gray-600 hover:text-gray-800 font-medium"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute