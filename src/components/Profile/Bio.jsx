function Bio({ bio }) {
  return (
    <div className="mb-6">
      <p className="text-gray-900 leading-relaxed">
        {bio || 'No bio available.'}
      </p>
    </div>
  )
}

export default Bio