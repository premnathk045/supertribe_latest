import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiCamera, FiUser, FiLink } from 'react-icons/fi'
import { useDropzone } from 'react-dropzone'

const contentCategories = [
  'Art & Design', 'Photography', 'Technology', 'Fashion', 'Music',
  'Fitness', 'Food & Cooking', 'Travel', 'Gaming', 'Education',
  'Lifestyle', 'Business', 'Other'
]

function ProfileSetup({ initialData, onComplete, loading }) {
  const [formData, setFormData] = useState({
    bio: initialData?.bio || '',
    avatar_url: initialData?.avatar_url || '',
    social_links: {
      instagram: '',
      twitter: '',
      youtube: '',
      website: ''
    },
    content_categories: []
  })
  const [errors, setErrors] = useState({})
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(initialData?.avatar_url || '')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file) {
        setAvatarFile(file)
        const preview = URL.createObjectURL(file)
        setAvatarPreview(preview)
        setFormData(prev => ({ ...prev, avatar_url: preview }))
        if (errors.avatar_url) {
          setErrors(prev => ({ ...prev, avatar_url: '' }))
        }
      }
    }
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }))
  }

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      content_categories: prev.content_categories.includes(category)
        ? prev.content_categories.filter(c => c !== category)
        : [...prev.content_categories, category]
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required'
    } else if (formData.bio.length < 50) {
      newErrors.bio = 'Bio must be at least 50 characters'
    } else if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters'
    }

    if (!avatarPreview) {
      newErrors.avatar_url = 'Profile picture is required'
    }

    if (formData.content_categories.length === 0) {
      newErrors.content_categories = 'Please select at least one content category'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      // In a real app, you would upload the avatar file to Supabase Storage here
      // For demo purposes, we'll use the preview URL
      onComplete({
        bio: formData.bio,
        avatar_url: avatarPreview,
        // Store additional data in user_metadata or separate table
        social_links: formData.social_links,
        content_categories: formData.content_categories
      })
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Complete Your Profile
        </h2>
        <p className="text-gray-600">
          Set up your creator profile to attract followers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture *
          </label>
          <div
            {...getRootProps()}
            className={`relative w-32 h-32 mx-auto border-2 border-dashed rounded-full cursor-pointer transition-all ${
              isDragActive 
                ? 'border-primary-500 bg-primary-50' 
                : errors.avatar_url
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile preview"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <FiCamera className="text-2xl text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Upload Photo</p>
                </div>
              </div>
            )}
          </div>
          {errors.avatar_url && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-600 text-center"
            >
              {errors.avatar_url}
            </motion.p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio *
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none ${
              errors.bio ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Tell your audience about yourself and what kind of content you create..."
          />
          <div className="flex justify-between items-center mt-1">
            {errors.bio ? (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600"
              >
                {errors.bio}
              </motion.p>
            ) : (
              <div></div>
            )}
            <p className={`text-xs ${
              formData.bio.length > 500 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {formData.bio.length}/500
            </p>
          </div>
        </div>

        {/* Content Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Categories *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {contentCategories.map((category) => (
              <motion.button
                key={category}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryToggle(category)}
                className={`p-3 text-sm rounded-lg border transition-all ${
                  formData.content_categories.includes(category)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
          {errors.content_categories && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-600"
            >
              {errors.content_categories}
            </motion.p>
          )}
        </div>

        {/* Social Links */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Social Media Links (Optional)
          </label>
          <div className="space-y-3">
            {Object.entries(formData.social_links).map(([platform, value]) => (
              <div key={platform} className="relative">
                <FiLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  value={value}
                  onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            'Continue'
          )}
        </motion.button>
      </form>
    </div>
  )
}

export default ProfileSetup