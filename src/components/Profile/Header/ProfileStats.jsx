function ProfileStats({ stats }) {
  return (
    <div className="flex space-x-6 text-sm mb-6">
      <div className="text-center">
        <div className="font-bold text-gray-900">{stats.postCount}</div>
        <div className="text-gray-600">Posts</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-gray-900">{stats.followerCount}</div>
        <div className="text-gray-600">Followers</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-gray-900">{stats.followingCount}</div>
        <div className="text-gray-600">Following</div>
      </div>
    </div>
  )
}

export default ProfileStats