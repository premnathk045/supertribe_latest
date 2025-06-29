import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import StoriesCarousel from '../components/Stories/StoriesCarousel'
import PostFeed from '../components/Feed/PostFeed'
import Toast from '../components/UI/Toast'
import { supabase } from '../lib/supabase'

function HomePage() {
  const { openStoryViewer, openPostDetail, openShareSheet, openStoryCreation } = useOutletContext()
  const { isCreator, user } = useAuth()
  const [toast, setToast] = useState(null)

  // Set up real-time subscription for poll votes
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('poll-votes-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'poll_votes'
      }, (payload) => {
        console.log('Poll vote change detected:', payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const handlePostDelete = async (postId) => {
    if (!user) return
    
    try {
      // Delete post from Supabase
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      // Show success toast
      setToast({
        message: 'Post deleted successfully',
        type: 'success'
      })
      
    } catch (error) {
      console.error('Error deleting post:', error)
      
      // Show error toast
      setToast({
        message: 'Failed to delete post',
        type: 'error'
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* Stories Section */}
      <div className="bg-white border-b border-gray-200">
        <StoriesCarousel 
          onStoryClick={openStoryViewer}
          onCreateStory={isCreator() ? openStoryCreation : undefined}
        />
      </div>

      {/* Posts Feed */}
      <div className="max-w-lg mx-auto">
        <PostFeed 
          // Remove onPostClick to allow PostFeed to use its default navigation behavior
          onShareClick={openShareSheet}
          onDeletePost={handlePostDelete}
        />
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </motion.div>
  )
}

export default HomePage