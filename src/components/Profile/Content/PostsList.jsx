import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PostCard from '../../Feed/PostCard'

function PostsList({ posts, profileData }) {
  const navigate = useNavigate()
  
  const handlePostLike = (postId) => {
    console.log('Like post:', postId)
    // Would implement like functionality here
  }
  
  const handlePostSave = (postId) => {
    console.log('Save post:', postId)
    // Would implement save functionality here
  }
  
  const handlePostComment = (post) => {
    console.log('Comment on post:', post.id)
    // Would open comment modal or section
  }
  
  const handlePostShare = (post) => {
    console.log('Share post:', post.id)
    // Would open share modal
  }
  
  const handlePostClick = (post) => {
    console.log('Open post:', post.id)
    // Navigate to post detail page
    navigate(`/post/${post.id}`)
  }
  
  return (
    <div className="space-y-4 pb-8">
      {posts.map((post, index) => {
        // Add profile data to post for display
        const postWithUser = {
          ...post,
          user: {
            id: profileData.id,
            username: profileData.username,
            displayName: profileData.display_name,
            avatar: profileData.avatar_url,
            isVerified: profileData.is_verified
          }
        }
        
        return (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PostCard
              post={postWithUser}
              onLike={() => handlePostLike(post.id)}
              onSave={() => handlePostSave(post.id)}
              onComment={() => handlePostComment(post)}
              onShare={() => handlePostShare(post)}
              onClick={() => handlePostClick(post)}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

export default PostsList