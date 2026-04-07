-- =====================================================
-- Ward Mitra Enhanced Database Schema
-- Execute these in your Supabase SQL Editor
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
    ALTER TABLE complaints ADD COLUMN assigned_by UUID; -- corporator/admin who assigned
  END IF;
  
  -- Add resolution fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='complaints' AND column_name='resolved_at') THEN
    ALTER TABLE complaints ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE complaints ADD COLUMN resolution_proof TEXT[]; -- URLs of before/after photos
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
  updated_by_role TEXT, -- 'staff', 'corporator', 'admin'
  status TEXT NOT NULL,
  message TEXT,
  photos TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT TRUE, -- visible to citizen
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaint_updates_complaint ON complaint_updates(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_updates_created ON complaint_updates(created_at DESC);

-- 5. NOTIFICATIONS LOG
-- Track all notifications sent (WhatsApp, SMS, Email)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL, -- 'corporator', 'department', 'staff', 'citizen'
  recipient_id TEXT NOT NULL, -- phone/email/whatsapp number
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

-- 7. WHATSAPP QUEUE TABLE (if doesn't exist)
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
-- Trigger function to update analytics daily
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

-- Create trigger for analytics
DROP TRIGGER IF EXISTS complaint_analytics_trigger ON complaints;
CREATE TRIGGER complaint_analytics_trigger
  AFTER INSERT OR UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_complaint_analytics();

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on tables
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
-- View for complaint dashboard
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

-- View for department performance
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

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
-- Grant necessary permissions to authenticated users
GRANT SELECT ON departments TO authenticated;
GRANT SELECT ON staff TO authenticated;
GRANT SELECT, INSERT ON complaints TO authenticated;
GRANT SELECT, INSERT ON complaint_updates TO authenticated;
GRANT SELECT ON complaint_dashboard TO authenticated;
GRANT SELECT ON department_performance TO authenticated;

-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================
-- You can add sample staff/officers here if needed

COMMENT ON TABLE departments IS 'Municipal departments with officer contact information';
COMMENT ON TABLE staff IS 'Staff members and vendors who handle complaints';
COMMENT ON TABLE complaint_updates IS 'Timeline of all updates and progress on complaints';
COMMENT ON TABLE notifications IS 'Log of all notifications sent via WhatsApp/SMS/Email';
COMMENT ON TABLE complaint_analytics IS 'Daily analytics data for reporting and insights';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify everything is set up correctly

-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('departments', 'staff', 'complaints', 'complaint_updates', 'notifications', 'complaint_analytics')
ORDER BY table_name;

-- Check departments are seeded
SELECT code, name FROM departments ORDER BY name;

-- Check complaint table has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'complaints' 
  AND column_name IN ('ai_department', 'assigned_to', 'resolved_at', 'ai_priority')
ORDER BY column_name;
