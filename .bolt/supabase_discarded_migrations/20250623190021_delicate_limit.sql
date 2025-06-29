/*
  # Real-time Messaging System

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `type` (text, direct/group)
      - `name` (text, for group chats)
      - `avatar_url` (text, for group chats)
      - `created_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `conversation_participants`
      - `conversation_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key to auth.users)
      - `joined_at` (timestamp)
      - `last_read_at` (timestamp)
      - `is_active` (boolean)
    
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key)
      - `sender_id` (uuid, foreign key to auth.users)
      - `content` (text)
      - `message_type` (text, text/image/file)
      - `media_url` (text, optional)
      - `reply_to_id` (uuid, optional foreign key to messages)
      - `is_edited` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_presence`
      - `user_id` (uuid, primary key, foreign key to auth.users)
      - `status` (text, online/away/offline)
      - `last_seen_at` (timestamp)
      - `typing_in_conversation` (uuid, optional foreign key)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for conversation participants
    - Add policies for message access
    - Add policies for presence updates
*/

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'direct'::text,
  name text NULL,
  avatar_url text NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT conversations_type_check CHECK ((type = ANY (ARRAY['direct'::text, 'group'::text])))
) TABLESPACE pg_default;

-- Conversation participants table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamp with time zone NULL DEFAULT now(),
  last_read_at timestamp with time zone NULL DEFAULT now(),
  is_active boolean NULL DEFAULT true,
  CONSTRAINT conversation_participants_pkey PRIMARY KEY (conversation_id, user_id),
  CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
  CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'text'::text,
  media_url text NULL,
  reply_to_id uuid NULL,
  is_edited boolean NULL DEFAULT false,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT messages_reply_to_id_fkey FOREIGN KEY (reply_to_id) REFERENCES messages (id) ON DELETE SET NULL,
  CONSTRAINT messages_message_type_check CHECK ((message_type = ANY (ARRAY['text'::text, 'image'::text, 'file'::text])))
) TABLESPACE pg_default;

-- User presence table
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'offline'::text,
  last_seen_at timestamp with time zone NULL DEFAULT now(),
  typing_in_conversation uuid NULL,
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT user_presence_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_presence_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT user_presence_typing_in_conversation_fkey FOREIGN KEY (typing_in_conversation) REFERENCES conversations (id) ON DELETE SET NULL,
  CONSTRAINT user_presence_status_check CHECK ((status = ANY (ARRAY['online'::text, 'away'::text, 'offline'::text])))
) TABLESPACE pg_default;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON public.conversations USING btree (created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations USING btree (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants USING btree (conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages USING btree (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages USING btree (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON public.messages USING btree (reply_to_id);

CREATE INDEX IF NOT EXISTS idx_user_presence_status ON public.user_presence USING btree (status);
CREATE INDEX IF NOT EXISTS idx_user_presence_typing ON public.user_presence USING btree (typing_in_conversation);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can read conversations they participate in" ON public.conversations
  FOR SELECT TO authenticated USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update conversations they created" ON public.conversations
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Conversation participants policies
CREATE POLICY "Users can read participants in their conversations" ON public.conversation_participants
  FOR SELECT TO authenticated USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can manage their own participation" ON public.conversation_participants
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Conversation creators can add participants" ON public.conversation_participants
  FOR INSERT TO authenticated WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE created_by = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can read messages in their conversations" ON public.messages
  FOR SELECT TO authenticated USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can send messages to their conversations" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = sender_id AND
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE TO authenticated USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" ON public.messages
  FOR DELETE TO authenticated USING (auth.uid() = sender_id);

-- User presence policies
CREATE POLICY "Users can read all presence info" ON public.user_presence
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their own presence" ON public.user_presence
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create triggers for updating timestamps
CREATE TRIGGER trigger_update_conversations_updated_at 
  BEFORE UPDATE ON conversations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_messages_updated_at 
  BEFORE UPDATE ON messages 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_user_presence_updated_at 
  BEFORE UPDATE ON user_presence 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update conversation timestamp when new message is added
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Function to get or create direct conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_direct_conversation(user1_id uuid, user2_id uuid)
RETURNS uuid AS $$
DECLARE
  conversation_id uuid;
BEGIN
  -- Try to find existing direct conversation between the two users
  SELECT c.id INTO conversation_id
  FROM conversations c
  WHERE c.type = 'direct'
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp1 
      WHERE cp1.conversation_id = c.id AND cp1.user_id = user1_id AND cp1.is_active = true
    )
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp2 
      WHERE cp2.conversation_id = c.id AND cp2.user_id = user2_id AND cp2.is_active = true
    )
    AND (
      SELECT COUNT(*) FROM conversation_participants cp 
      WHERE cp.conversation_id = c.id AND cp.is_active = true
    ) = 2;

  -- If no conversation exists, create one
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (type, created_by)
    VALUES ('direct', user1_id)
    RETURNING id INTO conversation_id;

    -- Add both users as participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES 
      (conversation_id, user1_id),
      (conversation_id, user2_id);
  END IF;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count for a user
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