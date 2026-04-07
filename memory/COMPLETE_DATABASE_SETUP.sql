-- =====================================================
-- WARD 26 CITIZEN CONNECT - COMPLETE DATABASE SETUP
-- Execute this entire file in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: MAIN SCHEMA (Departments, Staff, Enhanced Complaints)
-- =====================================================

-- 1. DEPARTMENTS TABLE
-- Stores all municipal departments with officer contact info
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  whatsapp_numbers TEXT[] DEFAULT '{}',
  sms_numbers TEXT[] DEFAULT '{}',
  email_addresses TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default departments
INSERT INTO departments (name, code, description) VALUES
('Roads & Footpaths', 'roads', 'Road repairs, potholes, footpath maintenance'),
('Water Supply', 'water', 'Water supply issues, leaks, quality problems'),
('Drainage & Sewage', 'drainage', 'Drainage blockages, sewage overflow, cleaning'),
('Garbage Collection', 'garbage', 'Waste collection, disposal, cleanliness'),
('Street Lights', 'lights', 'Street light repairs, installations, maintenance'),
('Encroachment', 'encroachment', 'Illegal encroachments, unauthorized construction'),
('Pollution', 'pollution', 'Air, water, noise pollution complaints'),
('Parks & Gardens', 'parks', 'Park maintenance, garden upkeep'),
('Buildings & Construction', 'buildings', 'Building repairs, construction issues'),
('Others', 'others', 'General issues not covered in other categories')
ON CONFLICT (code) DO NOTHING;

-- 2. STAFF/VENDORS TABLE
-- Stores staff members and vendors who handle complaints
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  department_code TEXT REFERENCES departments(code),
  role TEXT NOT NULL CHECK (role IN ('staff', 'vendor', 'supervisor', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department_code);
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(is_active);

-- 3. ENHANCE EXISTING COMPLAINTS TABLE
-- Add new columns to complaints table (if table exists)
DO $$ 
BEGIN
  -- Add AI categorization fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='complaints' AND column_name='ai_department') THEN
    ALTER TABLE complaints ADD COLUMN ai_department TEXT;
    ALTER TABLE complaints ADD COLUMN ai_priority TEXT CHECK (ai_priority IN ('urgent', 'normal', 'low'));
    ALTER TABLE complaints ADD COLUMN ai_sentiment TEXT CHECK (ai_sentiment IN ('angry', 'frustrated', 'neutral', 'polite'));
    ALTER TABLE complaints ADD COLUMN ai_confidence DECIMAL(3,2);
  END IF;
  
  -- Add assignment fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='complaints' AND column_name='assigned_to') THEN
    ALTER TABLE complaints ADD COLUMN assigned_to UUID REFERENCES staff(id);
    ALTER TABLE complaints ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE complaints ADD COLUMN assigned_by UUID;
  END IF;
  
  -- Add resolution fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='complaints' AND column_name='resolved_at') THEN
    ALTER TABLE complaints ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE complaints ADD COLUMN resolution_proof TEXT[];
    ALTER TABLE complaints ADD COLUMN resolution_notes TEXT;
    ALTER TABLE complaints ADD COLUMN estimated_resolution_date DATE;
  END IF;
  
  -- Add duplicate detection
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='complaints' AND column_name='is_duplicate') THEN
    ALTER TABLE complaints ADD COLUMN is_duplicate BOOLEAN DEFAULT FALSE;
    ALTER TABLE complaints ADD COLUMN duplicate_of UUID REFERENCES complaints(id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaints_department ON complaints(ai_department);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned ON complaints(assigned_to);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(ai_priority);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON complaints(created_at DESC);

-- 4. COMPLAINT UPDATES/PROGRESS TABLE
-- Track all status updates and progress on complaints
CREATE TABLE IF NOT EXISTS complaint_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  updated_by UUID REFERENCES staff(id),
  updated_by_role TEXT,
  status TEXT NOT NULL,
  message TEXT,
  photos TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaint_updates_complaint ON complaint_updates(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_updates_created ON complaint_updates(created_at DESC);

-- 5. NOTIFICATIONS LOG
-- Track all notifications sent (WhatsApp, SMS, Email)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  recipient_name TEXT,
  message TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email', 'push')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_complaint ON notifications(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- 6. COMPLAINT ANALYTICS TABLE
-- Store analytics data for reporting
CREATE TABLE IF NOT EXISTS complaint_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  department_code TEXT REFERENCES departments(code),
  total_complaints INTEGER DEFAULT 0,
  resolved_complaints INTEGER DEFAULT 0,
  pending_complaints INTEGER DEFAULT 0,
  urgent_complaints INTEGER DEFAULT 0,
  avg_resolution_time_hours DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, department_code)
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON complaint_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_department ON complaint_analytics(department_code);

-- 7. WHATSAPP QUEUE TABLE
CREATE TABLE IF NOT EXISTS whatsapp_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  complaint_id UUID REFERENCES complaints(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_queue_status ON whatsapp_queue(status);

-- 8. FUNCTIONS FOR AUTOMATIC ANALYTICS UPDATE
CREATE OR REPLACE FUNCTION update_complaint_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO complaint_analytics (date, department_code, total_complaints, resolved_complaints, pending_complaints, urgent_complaints)
  SELECT 
    CURRENT_DATE,
    NEW.ai_department,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'resolved'),
    COUNT(*) FILTER (WHERE status IN ('pending', 'in_progress')),
    COUNT(*) FILTER (WHERE ai_priority = 'urgent')
  FROM complaints
  WHERE ai_department = NEW.ai_department
    AND DATE(created_at) = CURRENT_DATE
  ON CONFLICT (date, department_code) 
  DO UPDATE SET
    total_complaints = EXCLUDED.total_complaints,
    resolved_complaints = EXCLUDED.resolved_complaints,
    pending_complaints = EXCLUDED.pending_complaints,
    urgent_complaints = EXCLUDED.urgent_complaints;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS complaint_analytics_trigger ON complaints;
CREATE TRIGGER complaint_analytics_trigger
  AFTER INSERT OR UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_complaint_analytics();

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Departments: Public read, admin write
CREATE POLICY "Departments are viewable by everyone" ON departments
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify departments" ON departments
  FOR ALL USING (auth.role() = 'service_role');

-- Staff: Public read active staff, admin write
CREATE POLICY "Active staff viewable by everyone" ON staff
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can modify staff" ON staff
  FOR ALL USING (auth.role() = 'service_role');

-- Complaint updates: Citizens can view their own, staff can add
CREATE POLICY "Users can view their complaint updates" ON complaint_updates
  FOR SELECT USING (
    complaint_id IN (
      SELECT id FROM complaints WHERE user_id = auth.uid()
    ) AND is_public = true
  );

CREATE POLICY "Staff can create updates" ON complaint_updates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 10. VIEWS FOR EASY QUERYING
CREATE OR REPLACE VIEW complaint_dashboard AS
SELECT 
  c.*,
  u.full_name as citizen_name,
  u.phone as citizen_phone,
  u.epic_number as citizen_epic,
  s.name as assigned_staff_name,
  s.phone as assigned_staff_phone,
  d.name as department_name,
  (SELECT COUNT(*) FROM complaint_updates WHERE complaint_id = c.id) as update_count,
  EXTRACT(EPOCH FROM (COALESCE(c.resolved_at, NOW()) - c.created_at))/3600 as hours_open
FROM complaints c
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN staff s ON c.assigned_to = s.id
LEFT JOIN departments d ON c.ai_department = d.code;

CREATE OR REPLACE VIEW department_performance AS
SELECT 
  d.code,
  d.name,
  COUNT(c.id) as total_complaints,
  COUNT(c.id) FILTER (WHERE c.status = 'resolved') as resolved,
  COUNT(c.id) FILTER (WHERE c.status IN ('pending', 'in_progress')) as pending,
  COUNT(c.id) FILTER (WHERE c.ai_priority = 'urgent') as urgent,
  AVG(EXTRACT(EPOCH FROM (c.resolved_at - c.created_at))/3600) FILTER (WHERE c.resolved_at IS NOT NULL) as avg_resolution_hours,
  COUNT(DISTINCT c.assigned_to) as active_staff
FROM departments d
LEFT JOIN complaints c ON d.code = c.ai_department
WHERE d.is_active = true
GROUP BY d.code, d.name;

-- Grant permissions
GRANT SELECT ON departments TO authenticated;
GRANT SELECT ON staff TO authenticated;
GRANT SELECT, INSERT ON complaints TO authenticated;
GRANT SELECT, INSERT ON complaint_updates TO authenticated;
GRANT SELECT ON complaint_dashboard TO authenticated;
GRANT SELECT ON department_performance TO authenticated;

-- =====================================================
-- PART 2: USER COMPLAINT COUNTER
-- =====================================================

-- Add complaint_count field to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS complaint_count INTEGER DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_complaint_count ON users(complaint_count);

-- Update existing users to have complaint_count = 0
UPDATE users 
SET complaint_count = 0 
WHERE complaint_count IS NULL;

-- =====================================================
-- PART 3: JANASEVAK NOTICE BOARD
-- =====================================================

-- 1. POSTS TABLE
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
CREATE TABLE IF NOT EXISTS janasevak_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES janasevak_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create indexes
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

-- Seed sample posts
INSERT INTO janasevak_posts (title, content, category, is_pinned) VALUES
(
  'Welcome to Janasevak - Your Direct Connection!',
  'Namaste Ward 26 Citizens!

I am delighted to launch this Janasevak platform to stay connected with all of you. Here I will share important updates, event invitations, schemes, and achievements of our ward.

Your feedback and participation are valuable to me. Together, we will make Ward 26 the best ward in Kalyan-Dombivli!

Jai Hind! Jai Maharashtra!

- Aasawari Kedar Navare
Corporator, Ward 26',
  'announcement',
  true
),
(
  'Free Medical Camp - This Sunday',
  'We are organizing a FREE Medical Camp this Sunday, 10 AM onwards at Rajaji Path Community Center.

Services:
✓ General Health Checkup
✓ Blood Pressure & Sugar Testing
✓ Eye Checkup
✓ Free Medicines

All Ward 26 residents are welcome. Please bring your Voter ID for registration.

See you there!',
  'event',
  false
),
(
  'New Street Lights Installation Complete',
  'Happy to announce that we have successfully installed 45 new LED street lights across Ward 26!

Areas covered:
• Ayare Road
• Ram Nagar
• Shiv Market Area
• Savarkar Road

This will improve safety and visibility in our ward. Thank you for your patience during the installation work.',
  'achievement',
  false
) ON CONFLICT DO NOTHING;

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

-- =====================================================
-- VERIFICATION & SUMMARY
-- =====================================================

-- Check all tables exist
SELECT 
  'Tables Created:' as status,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'departments', 
    'staff', 
    'complaints', 
    'complaint_updates', 
    'notifications', 
    'complaint_analytics',
    'whatsapp_queue',
    'janasevak_posts',
    'janasevak_post_likes'
  );

-- Check departments are seeded
SELECT 'Departments Seeded:' as status, COUNT(*) as count FROM departments;

-- Check Janasevak posts seeded
SELECT 'Janasevak Posts Seeded:' as status, COUNT(*) as count FROM janasevak_posts;

-- Success message
SELECT 
  '✅ DATABASE SETUP COMPLETE!' as message,
  'All tables, indexes, triggers, and sample data have been created successfully.' as details;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE departments IS 'Municipal departments with officer contact information';
COMMENT ON TABLE staff IS 'Staff members and vendors who handle complaints';
COMMENT ON TABLE complaint_updates IS 'Timeline of all updates and progress on complaints';
COMMENT ON TABLE notifications IS 'Log of all notifications sent via WhatsApp/SMS/Email';
COMMENT ON TABLE complaint_analytics IS 'Daily analytics data for reporting and insights';
COMMENT ON TABLE janasevak_posts IS 'Posts from corporator for citizen notice board';
COMMENT ON TABLE janasevak_post_likes IS 'Citizen likes on janasevak posts';
