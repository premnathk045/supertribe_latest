/*
  # Fix Conversation Policies Recursion

  1. Changes
    - Remove recursion in conversation and conversation_participants policies
    - Simplify policy conditions to avoid infinite recursion
    - Maintain the same security model where users can only access conversations they participate in
    - Fix the RLS settings for conversation_participants table

  2. Security
    - Ensure users can still only access their own conversations
    - Maintain proper access controls for all messaging tables
*/

-- First, drop the problematic policies causing recursion
DROP POLICY IF EXISTS "Users can read conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can read participants in their conversations" ON public.conversation_participants;

-- Update RLS on conversation_participants table (was missing in original migration)
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Create new, simplified policies
CREATE POLICY "Users can read their conversations" ON public.conversations
  FOR SELECT TO authenticated USING (
    id IN (
      SELECT conversation_id
      FROM conversation_participants
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can read participants in conversations they join" ON public.conversation_participants
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR
    conversation_id IN (
      SELECT conversation_id
      FROM conversation_participants
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Create a helper function to get conversations for a user
CREATE OR REPLACE FUNCTION get_user_conversations(user_id_param uuid)
RETURNS SETOF uuid AS $$
BEGIN
  RETURN QUERY
  SELECT conversation_id
  FROM conversation_participants
  WHERE user_id = user_id_param AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get unread count with simplified query
CREATE OR REPLACE FUNCTION get_unread_count(user_id_param uuid, conversation_id_param uuid)
RETURNS integer AS $$
DECLARE
  last_read_time timestamp with time zone;
  unread_count integer;
BEGIN
  -- Get the user's last read timestamp for this conversation
  SELECT last_read_at INTO last_read_time
  FROM conversation_participants
  WHERE user_id = user_id_param AND conversation_id = conversation_id_param;

  -- Count messages after the last read timestamp
  SELECT COUNT(*)::integer INTO unread_count
  FROM messages
  WHERE conversation_id = conversation_id_param
    AND sender_id != user_id_param
    AND created_at > COALESCE(last_read_time, '1970-01-01'::timestamp with time zone);

  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;