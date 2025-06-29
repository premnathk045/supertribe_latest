import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiRefreshCw, FiCheck, FiX, FiUpload, FiTrash2, FiInfo } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { 
  verifyStorageBuckets, 
  testStorageUpload, 
  getStorageStats, 
  cleanupExpiredStories,
  checkStoragePolicies 
} from '../../lib/storageUtils'

function StorageDebugPanel() {
  const { user } = useAuth()
  const [status, setStatus] = useState({
    bucketsVerified: null,
    uploadTest: null,
    policyTest: null,
    storageStats: null,
    loading: false
  })

  const runDiagnostics = async () => {
    setStatus(prev => ({ ...prev, loading: true }))
    
    try {
      // Verify buckets
      const bucketsOk = await verifyStorageBuckets()
      setStatus(prev => ({ ...prev, bucketsVerified: bucketsOk }))
      
      // Test upload (only if user is authenticated)
      let uploadOk = null
      if (user) {
        uploadOk = await testStorageUpload(user.id)
      }
      setStatus(prev => ({ ...prev, uploadTest: uploadOk }))
      
      // Check policies
      const policyResults = await checkStoragePolicies()
      setStatus(prev => ({ ...prev, policyTest: policyResults }))
      
      // Get storage stats
      const stats = await getStorageStats()
      setStatus(prev => ({ ...prev, storageStats: stats }))
      
    } catch (error) {
      console.error('Diagnostics failed:', error)
    } finally {
      setStatus(prev => ({ ...prev, loading: false }))
    }
  }

  const handleCleanup = async () => {
    const success = await cleanupExpiredStories()
    if (success) {
      alert('Cleanup completed successfully!')
      runDiagnostics() // Refresh stats
    } else {
      alert('Cleanup failed. Check console for details.')
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [user])

  const StatusIcon = ({ status }) => {
    if (status === null) return <FiInfo className="text-gray-400" />
    return status ? <FiCheck className="text-green-500" /> : <FiX className="text-red-500" />
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Storage Debug Panel</h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={runDiagnostics}
          disabled={status.loading}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <FiRefreshCw className={`text-lg ${status.loading ? 'animate-spin' : ''}`} />
          <span>Run Diagnostics</span>
        </motion.button>
      </div>

      <div className="space-y-4">
        {/* Bucket Verification */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900">Storage Buckets</h3>
            <p className="text-sm text-gray-600">story-media & story-thumbnails</p>
          </div>
          <StatusIcon status={status.bucketsVerified} />
        </div>

        {/* Upload Test */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900">Upload Test</h3>
            <p className="text-sm text-gray-600">
              {user ? 'Test file upload/delete' : 'Requires authentication'}
            </p>
          </div>
          <StatusIcon status={status.uploadTest} />
        </div>

        {/* Policy Test */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Storage Policies</h3>
          {status.policyTest ? (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <StatusIcon status={status.policyTest.canUpload} />
                <span>Upload</span>
              </div>
              <div className="flex items-center space-x-2">
                <StatusIcon status={status.policyTest.canRead} />
                <span>Read</span>
              </div>
              <div className="flex items-center space-x-2">
                <StatusIcon status={status.policyTest.canDelete} />
                <span>Delete</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Testing policies...</p>
          )}
        </div>

        {/* Storage Stats */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Storage Statistics</h3>
          {status.storageStats ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Story Media Files:</span>
                <span className="ml-2 font-medium">{status.storageStats.storyMediaCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Thumbnail Files:</span>
                <span className="ml-2 font-medium">{status.storageStats.thumbnailCount}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Loading stats...</p>
          )}
        </div>

        {/* Cleanup Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCleanup}
          className="w-full flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors"
        >
          <FiTrash2 className="text-lg" />
          <span>Cleanup Expired Stories</span>
        </motion.button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Setup Instructions</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>1. Run the migration: <code>verify_storage_setup.sql</code></p>
          <p>2. Ensure all status indicators show green checkmarks</p>
          <p>3. Test story creation and upload functionality</p>
          <p>4. Set up automated cleanup for expired stories</p>
        </div>
      </div>
    </div>
  )
}

export default StorageDebugPanel