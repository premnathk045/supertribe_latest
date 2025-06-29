import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  FiArrowLeft, 
  FiTrendingUp, 
  FiUsers, 
  FiDollarSign, 
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiShare,
  FiPlus
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

function CreatorDashboardPage() {
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const [stats, setStats] = useState({
    totalViews: 12450,
    totalLikes: 3240,
    totalFollowers: 1580,
    totalEarnings: 245.50,
    monthlyGrowth: 12.5
  })

  const recentPosts = [
    {
      id: 1,
      title: 'Digital Art Tutorial',
      views: 1250,
      likes: 340,
      comments: 28,
      shares: 15,
      earnings: 45.50,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 2,
      title: 'Behind the Scenes',
      views: 890,
      likes: 210,
      comments: 18,
      shares: 8,
      earnings: 32.00,
      createdAt: new Date('2024-01-14')
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          
          <h1 className="text-lg font-semibold">Creator Dashboard</h1>
          
          <button
            onClick={() => navigate('/create')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <FiPlus className="text-lg" />
            <span>Create</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white mb-8"
        >
          <div className="flex items-center space-x-4">
            <img
              src={userProfile?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
            />
            <div>
              <h2 className="text-2xl font-bold">
                Welcome back, {userProfile?.display_name || 'Creator'}!
              </h2>
              <p className="opacity-90">
                Ready to create amazing content today?
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiEye className="text-xl text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <FiTrendingUp className="text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+{stats.monthlyGrowth}%</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalLikes.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiHeart className="text-xl text-red-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <FiTrendingUp className="text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+8.2%</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Followers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalFollowers.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FiUsers className="text-xl text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <FiTrendingUp className="text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+15.3%</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-xl border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalEarnings.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FiDollarSign className="text-xl text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <FiTrendingUp className="text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+22.1%</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </motion.div>
        </div>

        {/* Recent Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
            <button className="text-primary-500 hover:text-primary-600 font-medium">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{post.title}</h4>
                  <p className="text-sm text-gray-500">
                    {post.createdAt.toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <FiEye className="text-blue-500" />
                    <span>{post.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiHeart className="text-red-500" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiMessageCircle className="text-green-500" />
                    <span>{post.comments}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiDollarSign className="text-yellow-500" />
                    <span>${post.earnings}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <button
            onClick={() => navigate('/create')}
            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-left"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <FiPlus className="text-xl text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Create New Post</h3>
            <p className="text-sm text-gray-600">Share your latest content with followers</p>
          </button>

          <button className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-left">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FiTrendingUp className="text-xl text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">View Analytics</h3>
            <p className="text-sm text-gray-600">Detailed insights about your content</p>
          </button>

          <button className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-left">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FiDollarSign className="text-xl text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Earnings Report</h3>
            <p className="text-sm text-gray-600">Track your monetization progress</p>
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default CreatorDashboardPage