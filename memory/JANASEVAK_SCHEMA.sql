-- Janasevak Notice Board Database Schema
-- Run this in your Supabase SQL Editor

-- 1. POSTS TABLE
-- Stores all posts from corporator
CREATE TABLE IF NOT EXISTS janasevak_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('news', 'notice', 'invitation', 'achievement', 'announcement', 'event', 'scheme')),
  media_type TEXT CHECK (media_type IN ('image', 'video', 'none')),
  media_urls TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_by TEXT DEFAULT 'Aasawari Kedar Navare',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. POST LIKES TABLE
-- Tracks which users liked which posts
CREATE TABLE IF NOT EXISTS janasevak_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES janasevak_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_janasevak_posts_created ON janasevak_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_janasevak_posts_pinned ON janasevak_posts(is_pinned, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_janasevak_posts_category ON janasevak_posts(category);
CREATE INDEX IF NOT EXISTS idx_janasevak_post_likes_post ON janasevak_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_janasevak_post_likes_user ON janasevak_post_likes(user_id);

-- Function to update likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE janasevak_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE janasevak_posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update likes count
DROP TRIGGER IF EXISTS janasevak_post_likes_trigger ON janasevak_post_likes;
CREATE TRIGGER janasevak_post_likes_trigger
  AFTER INSERT OR DELETE ON janasevak_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_post_views(post_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE janasevak_posts 
  SET views = views + 1 
  WHERE id = post_uuid;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE janasevak_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE janasevak_post_likes ENABLE ROW LEVEL SECURITY;

-- Everyone can view posts
CREATE POLICY "Posts are viewable by everyone" ON janasevak_posts
  FOR SELECT USING (true);

-- Only admins can create/modify posts
CREATE POLICY "Only admins can modify posts" ON janasevak_posts
  FOR ALL USING (auth.role() = 'service_role');

-- Users can view likes
CREATE POLICY "Likes are viewable by everyone" ON janasevak_post_likes
  FOR SELECT USING (true);

-- Authenticated users can like posts
CREATE POLICY "Users can like posts" ON janasevak_post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can unlike their own likes
CREATE POLICY "Users can unlike posts" ON janasevak_post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON janasevak_posts TO authenticated;
GRANT SELECT, INSERT, DELETE ON janasevak_post_likes TO authenticated;

-- Seed some sample posts
INSERT INTO janasevak_posts (title, content, category, is_pinned) VALUES
(
  'Welcome to Janasevak - Your Direct Connection!',
  'Namaste Ward 26 Citizens!\n\nI am delighted to launch this Janasevak platform to stay connected with all of you. Here I will share important updates, event invitations, schemes, and achievements of our ward.\n\nYour feedback and participation are valuable to me. Together, we will make Ward 26 the best ward in Kalyan-Dombivli!\n\nJai Hind! Jai Maharashtra!\n\n- Aasawari Kedar Navare\nCorporator, Ward 26',
  'announcement',
  true
),
(
  'Free Medical Camp - This Sunday',
  'We are organizing a FREE Medical Camp this Sunday, 10 AM onwards at Rajaji Path Community Center.\n\nServices:\n✓ General Health Checkup\n✓ Blood Pressure & Sugar Testing\n✓ Eye Checkup\n✓ Free Medicines\n\nAll Ward 26 residents are welcome. Please bring your Voter ID for registration.\n\nSee you there!',
  'event',
  false
),
(
  'New Street Lights Installation Complete',
  'Happy to announce that we have successfully installed 45 new LED street lights across Ward 26!\n\nAreas covered:\n• Ayare Road\n• Ram Nagar\n• Shiv Market Area\n• Savarkar Road\n\nThis will improve safety and visibility in our ward. Thank you for your patience during the installation work.',
  'achievement',
  false
);

-- View for posts with like status
CREATE OR REPLACE VIEW janasevak_posts_with_likes AS
SELECT 
  p.*,
  COALESCE(l.liked_by_users, '{}') as liked_by_users
FROM janasevak_posts p
LEFT JOIN (
  SELECT 
    post_id,
    array_agg(user_id) as liked_by_users
  FROM janasevak_post_likes
  GROUP BY post_id
) l ON p.id = l.post_id;

COMMENT ON TABLE janasevak_posts IS 'Posts from corporator for citizen notice board';
COMMENT ON TABLE janasevak_post_likes IS 'Citizen likes on janasevak posts';
