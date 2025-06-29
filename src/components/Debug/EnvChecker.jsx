import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiEye, FiEyeOff, FiCopy, FiCheck } from 'react-icons/fi'

function EnvChecker() {
  const [showKeys, setShowKeys] = useState(false)
  const [copied, setCopied] = useState('')

  const envVars = {
    'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
    'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY
  }

  const copyToClipboard = (key, value) => {
    navigator.clipboard.writeText(value)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const maskValue = (value) => {
    if (!value) return 'Not set'
    if (value.length <= 20) return value
    return `${value.substring(0, 10)}...${value.substring(value.length - 10)}`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Environment Variables</h3>
        <button
          onClick={() => setShowKeys(!showKeys)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
        >
          {showKeys ? <FiEyeOff /> : <FiEye />}
          <span>{showKeys ? 'Hide' : 'Show'} Values</span>
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">{key}</p>
              <p className="text-xs text-gray-600 font-mono">
                {showKeys ? (value || 'Not set') : maskValue(value)}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
              
              {value && (
                <button
                  onClick={() => copyToClipboard(key, value)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {copied === key ? <FiCheck className="text-green-500" /> : <FiCopy />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {(!envVars.VITE_SUPABASE_URL || !envVars.VITE_SUPABASE_ANON_KEY) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            <strong>Missing environment variables!</strong> Create a <code>.env</code> file in your project root with:
          </p>
          <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto">
{`VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}
          </pre>
        </div>
      )}
    </div>
  )
}

export default EnvChecker