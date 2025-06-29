import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiX, FiRefreshCw } from 'react-icons/fi'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import EnvChecker from './EnvChecker'

function SupabaseDebug() {
  const { user, userProfile } = useAuth()
  const [tests, setTests] = useState({
    envVars: null,
    connection: null,
    auth: null,
    postsTable: null,
    storage: null
  })
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const results = {}

    // Test 1: Environment Variables
    console.log('🧪 Testing environment variables...')
    results.envVars = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

    // Test 2: Supabase Connection
    console.log('🧪 Testing Supabase connection...')
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      results.connection = !error
      console.log('✅ Connection test result:', { data, error })
    } catch (error) {
      console.error('❌ Connection test failed:', error)
      results.connection = false
    }

    // Test 3: Authentication
    console.log('🧪 Testing authentication...')
    results.auth = !!user

    // Test 4: Posts Table Access
    console.log('🧪 Testing posts table access...')
    try {
      const { data, error } = await supabase.from('posts').select('count').limit(1)
      results.postsTable = !error
      console.log('✅ Posts table test result:', { data, error })
    } catch (error) {
      console.error('❌ Posts table test failed:', error)
      results.postsTable = false
    }

    // Test 5: Storage Access
    console.log('🧪 Testing storage access...')
    try {
      const { data, error } = await supabase.storage.listBuckets()
      results.storage = !error
      console.log('✅ Storage test result:', { data, error })
    } catch (error) {
      console.error('❌ Storage test failed:', error)
      results.storage = false
    }

    setTests(results)
    setLoading(false)
  }

  useEffect(() => {
    runTests()
  }, [user])

  const testCreatePost = async () => {
    if (!user) {
      alert('Please sign in first')
      return
    }

    console.log('🧪 Testing post creation...')
    
    try {
      const testPost = {
        user_id: user.id,
        content: `Test post created at ${new Date().toISOString()}`,
        media_urls: null,
        is_premium: false,
        price: null,
        subscriber_discount: null,
        tags: ['test'],
        poll: null,
        preview_video_url: null,
        scheduled_for: null,
        status: 'published'
      }

      console.log('📝 Test post data:', testPost)

      const { data, error } = await supabase
        .from('posts')
        .insert([testPost])
        .select()
        .single()

      if (error) {
        console.error('❌ Test post creation failed:', error)
        alert(`Post creation failed: ${error.message}`)
      } else {
        console.log('✅ Test post created successfully:', data)
        alert('Test post created successfully!')
      }
    } catch (error) {
      console.error('❌ Test post creation error:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const StatusIcon = ({ status }) => {
    if (status === null) return <FiRefreshCw className="text-gray-400 animate-spin" />
    return status ? <FiCheck className="text-green-500" /> : <FiX className="text-red-500" />
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Supabase Debug Panel</h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={runTests}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <FiRefreshCw className={`text-lg ${loading ? 'animate-spin' : ''}`} />
          <span>Run Tests</span>
        </motion.button>
      </div>

      {/* Environment Variables */}
      <div className="mb-6">
        <EnvChecker />
      </div>

      {/* User Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">User Info</h3>
        <div className="text-sm space-y-1">
          <p><strong>User:</strong> {user ? user.email : 'Not authenticated'}</p>
          <p><strong>User ID:</strong> {user ? user.id : 'N/A'}</p>
          <p><strong>User Profile:</strong> {userProfile ? 'Loaded' : 'Not loaded'}</p>
          <p><strong>User Type:</strong> {userProfile?.user_type || 'N/A'}</p>
          <p><strong>Is Verified:</strong> {userProfile?.is_verified ? 'Yes' : 'No'}</p>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900">Environment Variables</h3>
            <p className="text-sm text-gray-600">VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</p>
          </div>
          <StatusIcon status={tests.envVars} />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900">Supabase Connection</h3>
            <p className="text-sm text-gray-600">Basic connection to Supabase</p>
          </div>
          <StatusIcon status={tests.connection} />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900">Authentication</h3>
            <p className="text-sm text-gray-600">User is signed in</p>
          </div>
          <StatusIcon status={tests.auth} />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900">Posts Table Access</h3>
            <p className="text-sm text-gray-600">Can query the posts table</p>
          </div>
          <StatusIcon status={tests.postsTable} />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900">Storage Access</h3>
            <p className="text-sm text-gray-600">Can access Supabase storage</p>
          </div>
          <StatusIcon status={tests.storage} />
        </div>
      </div>

      {/* Test Actions */}
      <div className="mt-6 space-y-3">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={testCreatePost}
          disabled={!user}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors"
        >
          Test Post Creation
        </motion.button>
        
        <p className="text-xs text-gray-500 text-center">
          This will create a test post in your database. Make sure you're signed in.
        </p>
      </div>
    </div>
  )
}

export default SupabaseDebug