import { motion } from 'framer-motion'

function CategoryGrid({ categories, onCategorySelect }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((category, index) => (
        <motion.button
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onCategorySelect(category)}
          className="bg-white p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-left"
        >
          <div className="text-2xl mb-2">{category.icon}</div>
          <h4 className="font-semibold text-gray-900 mb-1">{category.name}</h4>
          <p className="text-sm text-gray-500">{category.count} creators</p>
        </motion.button>
      ))}
    </div>
  )
}

export default CategoryGrid