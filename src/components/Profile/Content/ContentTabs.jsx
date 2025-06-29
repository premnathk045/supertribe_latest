import { motion } from 'framer-motion'
import { FiGrid, FiBookmark, FiHeart } from 'react-icons/fi'

function ContentTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'posts', label: 'Posts', icon: FiGrid },
    { id: 'saved', label: 'Saved', icon: FiBookmark },
    { id: 'liked', label: 'Liked', icon: FiHeart }
  ]

  return (
    <div className="flex border-t border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 py-3 flex items-center justify-center space-x-2 border-b-2 transition-colors ${
            activeTab === tab.id
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <tab.icon className="text-lg" />
          <span className="font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

export default ContentTabs