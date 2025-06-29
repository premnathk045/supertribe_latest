import { Outlet, useLocation, matchPath } from 'react-router-dom'
import { useState } from 'react'
import TopNavigation from './TopNavigation'
import BottomNavigation from './BottomNavigation'
import SettingsModal from '../Modals/SettingsModal'
import StoryViewerModal from '../Modals/StoryViewerModal'
import PostDetailModal from '../Modals/PostDetailModal'
import ShareSheetModal from '../Modals/ShareSheetModal'
import StoryCreationModal from '../Stories/StoryCreationModal'
import { useStories } from '../../hooks/useStories'

function Layout() {
  const location = useLocation()
  const { addNewStory } = useStories()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [storyViewerOpen, setStoryViewerOpen] = useState(false)
  const [postDetailOpen, setPostDetailOpen] = useState(false)
  const [shareSheetOpen, setShareSheetOpen] = useState(false)
  const [storyCreationOpen, setStoryCreationOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)

  // Hide navigation on /create, /messages, and /post/:postId
  const hideNavigation =
    location.pathname === '/create' ||
    location.pathname === '/messages' ||
    matchPath('/post/:postId', location.pathname)

  const handleStoryPublish = (newStory) => {
    console.log('Story published:', newStory)
    // Add the new story to the stories list
    addNewStory(newStory)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavigation && (
        <TopNavigation onSettingsClick={() => setSettingsOpen(true)} />
      )}
      
      <main className={`${!hideNavigation ? 'pt-16 pb-20' : ''} transition-all duration-300`}>
        <Outlet context={{
          openStoryViewer: (storyGroup) => {
            // storyGroup: { userId, stories }
            setSelectedStory(storyGroup)
            setStoryViewerOpen(true)
          },
          openPostDetail: (post) => {
            setSelectedPost(post)
            setPostDetailOpen(true)
          },
          openShareSheet: () => setShareSheetOpen(true),
          openStoryCreation: () => setStoryCreationOpen(true)
        }} />
      </main>

      {!hideNavigation && <BottomNavigation />}

      {/* Modals */}
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
      
      <StoryViewerModal
        isOpen={storyViewerOpen}
        story={selectedStory}
        onClose={() => {
          setStoryViewerOpen(false)
          setSelectedStory(null)
        }}
      />
      
      <PostDetailModal
        isOpen={postDetailOpen}
        post={selectedPost}
        onClose={() => {
          setPostDetailOpen(false)
          setSelectedPost(null)
        }}
        onShare={() => setShareSheetOpen(true)}
      />
      
      <ShareSheetModal
        isOpen={shareSheetOpen}
        onClose={() => setShareSheetOpen(false)}
      />

      <StoryCreationModal
        isOpen={storyCreationOpen}
        onClose={() => setStoryCreationOpen(false)}
        onPublish={handleStoryPublish}
      />
    </div>
  )
}

export default Layout