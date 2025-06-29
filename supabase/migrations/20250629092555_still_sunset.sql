/*
  # Create Content Purchases Table

  1. New Tables
    - `content_purchases` - Tracks premium content purchases by users
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `post_id` (uuid, references posts)
      - `amount` (numeric, purchase amount)
      - `status` (text, purchase status)
      - `payment_method_id` (uuid, references payment_methods)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `content_purchases` table
    - Add policy for authenticated users to read their own purchases
    - Add policy for authenticated users to insert their own purchases
*/

-- Create content_purchases table
CREATE TABLE IF NOT EXISTS public.content_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  payment_method_id uuid REFERENCES payment_methods(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT content_purchases_status_check CHECK (
    status IN ('pending', 'completed', 'failed', 'refunded')
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_content_purchases_user_id ON public.content_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_content_purchases_post_id ON public.content_purchases(post_id);
CREATE INDEX IF NOT EXISTS idx_content_purchases_created_at ON public.content_purchases(created_at);

-- Enable RLS
ALTER TABLE public.content_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own purchases" 
  ON public.content_purchases
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own purchases" 
  ON public.content_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create function to check if user has purchased content
CREATE OR REPLACE FUNCTION has_purchased_content(user_id_param uuid, post_id_param uuid)
RETURNS boolean AS $$
DECLARE
  has_purchase boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM content_purchases 
    WHERE user_id = user_id_param 
    AND post_id = post_id_param 
    AND status = 'completed'
  ) INTO has_purchase;
  
  RETURN has_purchase;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger
CREATE TRIGGER trigger_update_content_purchases_updated_at
BEFORE UPDATE ON public.content_purchases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();