import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useStoryHighlights = (profileId) => {
  const [highlights, setHighlights] = useState([])
  const [userStories, setUserStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // Fetch highlights
  const fetchHighlights = async () => {
    if (!profileId) return

    try {
      setLoading(true)
      setError(null)

      // Fetch story highlights
      const { data: highlightsData, error: highlightsError } = await supabase
        .from('story_highlights')
        .select(`
          *,
          highlight_stories (
            story_id,
            stories (*)
          )
        `)
        .eq('user_id', profileId)
        .order('created_at', { ascending: false })

      if (highlightsError) throw highlightsError

      // Process highlights data
      const processedHighlights = highlightsData.map(highlight => {
        // Extract stories data
        const stories = highlight.highlight_stories
          ?.map(hs => hs.stories)
          .filter(Boolean) || []
        
        // Find cover story
        const coverStory = stories.find(s => s.id === highlight.cover_story_id) || stories[0]
        
        return {
          ...highlight,
          stories,
          media_url: coverStory?.media_url || coverStory?.thumbnail_url,
          thumbnail_url: coverStory?.thumbnail_url || coverStory?.media_url
        }
      })

      setHighlights(processedHighlights)
    } catch (err) {
      console.error('Error fetching highlights:', err)
      setError('Failed to load highlights')
    } finally {
      setLoading(false)
    }
  }

  // Fetch user stories (for creating highlights)
  const fetchUserStories = async () => {
    if (!profileId) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('creator_id', profileId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setUserStories(data || [])
    } catch (err) {
      console.error('Error fetching user stories:', err)
      // Don't set error here as this is a secondary data fetch
    } finally {
      setLoading(false)
    }
  }

  // Create a new highlight
  const createHighlight = async (highlightData) => {
    if (!profileId) return null

    try {
      setSaving(true)

      // Create highlight
      const { data: highlight, error: highlightError } = await supabase
        .from('story_highlights')
        .insert({
          user_id: profileId,
          title: highlightData.title,
          cover_story_id: highlightData.cover_id
        })
        .select()
        .single()

      if (highlightError) throw highlightError

      // Add stories to highlight
      const highlightStories = highlightData.stories.map(storyId => ({
        highlight_id: highlight.id,
        story_id: storyId
      }))

      const { error: storiesError } = await supabase
        .from('highlight_stories')
        .insert(highlightStories)

      if (storiesError) throw storiesError

      // Refresh highlights
      await fetchHighlights()
      
      return highlight
    } catch (err) {
      console.error('Error creating highlight:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  // Delete a highlight
  const deleteHighlight = async (highlightId) => {
    try {
      setSaving(true)

      // Delete highlight
      const { error } = await supabase
        .from('story_highlights')
        .delete()
        .eq('id', highlightId)

      if (error) throw error

      // Update local state
      setHighlights(prev => prev.filter(h => h.id !== highlightId))
    } catch (err) {
      console.error('Error deleting highlight:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  // Load highlights when profileId changes
  useEffect(() => {
    if (profileId) {
      fetchHighlights()
      fetchUserStories()
    }
  }, [profileId])

  return {
    highlights,
    userStories,
    loading,
    error,
    saving,
    fetchHighlights,
    fetchUserStories,
    createHighlight,
    deleteHighlight
  }
}

export default useStoryHighlights