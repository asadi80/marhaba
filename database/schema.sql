-- database/schema_fixed.sql
-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS analytics_yearly CASCADE;
DROP TABLE IF EXISTS analytics_monthly CASCADE;
DROP TABLE IF EXISTS analytics_daily CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS listing_analytics_daily CASCADE;
DROP TABLE IF EXISTS listing_analytics_monthly CASCADE;
DROP TABLE IF EXISTS listing_analytics_yearly CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(50) DEFAULT 'pending',
  status_reason TEXT,
  host_expiry_date TIMESTAMP,
  email_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP,
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMP,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  host_details JSONB DEFAULT '{"rating": 0, "totalListings": 0, "verified": false, "notificationSent": {"oneWeek": false, "twoDays": false}}',
  user_details JSONB DEFAULT '{"preferences": {}, "bookings": []}',
  id_images TEXT[] DEFAULT ARRAY[]::TEXT[],
  CHECK (role IN ('user', 'host', 'admin', 'super_admin')),
  CHECK (status IN ('pending', 'confirmed', 'suspended'))
);

-- =====================================================
-- LISTINGS TABLE
-- =====================================================
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  category VARCHAR(50) NOT NULL DEFAULT 'city',
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  host_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  rules TEXT[] DEFAULT ARRAY[]::TEXT[],
  status VARCHAR(20) DEFAULT 'active',
  blocked_dates JSONB DEFAULT '[]',
  views_count INTEGER DEFAULT 0,
  unique_views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (category IN ('beachfront', 'mountain', 'city', 'countryside', 'pool', 'desert', 'camping', 'cabins')),
  CHECK (status IN ('active', 'suspended', 'deleted'))
);

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  CHECK (check_in < check_out)
);

-- =====================================================
-- WEBSITE ANALYTICS TABLES
-- =====================================================

-- Raw events table for website traffic
CREATE TABLE analytics_events (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL, -- 'page_view', 'visit', 'signup', 'login', etc.
  page_url VARCHAR(1000),
  referrer_url VARCHAR(1000),
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(50), -- 'mobile', 'desktop', 'tablet'
  browser VARCHAR(50),
  os VARCHAR(50),
  visit_duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily website analytics
CREATE TABLE analytics_daily (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  
  -- Traffic metrics
  total_visits INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  
  -- Engagement metrics
  avg_session_duration_seconds INTEGER DEFAULT 0,
  avg_pages_per_session DECIMAL(5,2) DEFAULT 0,
  
  -- User metrics
  new_registrations INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  
  -- Traffic sources
  direct_traffic INTEGER DEFAULT 0,
  search_traffic INTEGER DEFAULT 0,
  referral_traffic INTEGER DEFAULT 0,
  social_traffic INTEGER DEFAULT 0,
  
  -- Device breakdown
  desktop_visits INTEGER DEFAULT 0,
  mobile_visits INTEGER DEFAULT 0,
  tablet_visits INTEGER DEFAULT 0,
  
  -- Geographic
  top_countries JSONB DEFAULT '[]',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monthly website analytics
CREATE TABLE analytics_monthly (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  date DATE NOT NULL UNIQUE,
  
  -- Aggregated metrics
  total_visits INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  avg_daily_visits DECIMAL(10,2) DEFAULT 0,
  
  -- Monthly metrics
  new_registrations INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  returning_users INTEGER DEFAULT 0,
  
  -- Engagement
  avg_session_duration_seconds INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Growth metrics
  growth_percent DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(year, month)
);

-- Yearly website analytics
CREATE TABLE analytics_yearly (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL UNIQUE,
  date DATE NOT NULL UNIQUE,
  
  -- Aggregated metrics
  total_visits INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  avg_monthly_visits DECIMAL(10,2) DEFAULT 0,
  
  -- Yearly metrics
  total_new_users INTEGER DEFAULT 0,
  avg_active_users_per_month DECIMAL(10,2) DEFAULT 0,
  
  -- Growth metrics
  yoy_growth_percent DECIMAL(5,2) DEFAULT 0,
  
  -- Peak periods
  peak_month VARCHAR(20),
  peak_visits INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- LISTING ANALYTICS TABLES
-- =====================================================

-- Daily listing analytics
CREATE TABLE listing_analytics_daily (
  id SERIAL PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Views metrics
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  
  -- Engagement metrics
  avg_view_duration_seconds INTEGER DEFAULT 0,
  
  -- Booking metrics
  bookings_count INTEGER DEFAULT 0,
  booking_value DECIMAL(10,2) DEFAULT 0,
  
  -- Inquiry metrics
  inquiries_count INTEGER DEFAULT 0,
  
  -- Wishlist metrics
  wishlist_adds INTEGER DEFAULT 0,
  wishlist_removes INTEGER DEFAULT 0,
  
  -- Conversion rates
  view_to_booking_rate DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(listing_id, date)
);

-- Monthly listing analytics
CREATE TABLE listing_analytics_monthly (
  id SERIAL PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  date DATE NOT NULL, -- First day of month
  
  -- Aggregated metrics
  total_views INTEGER DEFAULT 0,
  total_unique_views INTEGER DEFAULT 0,
  avg_daily_views DECIMAL(10,2) DEFAULT 0,
  
  -- Booking metrics
  total_bookings INTEGER DEFAULT 0,
  total_booking_value DECIMAL(10,2) DEFAULT 0,
  occupancy_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Performance metrics
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  revenue_per_view DECIMAL(10,2) DEFAULT 0,
  
  -- Ranking metrics (compared to other listings)
  category_rank INTEGER,
  area_rank INTEGER,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(listing_id, year, month)
);

-- Yearly listing analytics
CREATE TABLE listing_analytics_yearly (
  id SERIAL PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  date DATE NOT NULL, -- First day of year
  
  -- Aggregated metrics
  total_views INTEGER DEFAULT 0,
  total_unique_views INTEGER DEFAULT 0,
  avg_monthly_views DECIMAL(10,2) DEFAULT 0,
  
  -- Booking metrics
  total_bookings INTEGER DEFAULT 0,
  total_booking_value DECIMAL(10,2) DEFAULT 0,
  avg_booking_value DECIMAL(10,2) DEFAULT 0,
  
  -- Growth metrics
  views_growth_percent DECIMAL(5,2) DEFAULT 0,
  bookings_growth_percent DECIMAL(5,2) DEFAULT 0,
  revenue_growth_percent DECIMAL(5,2) DEFAULT 0,
  
  -- Best periods
  best_month VARCHAR(20),
  best_month_views INTEGER DEFAULT 0,
  best_month_revenue DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(listing_id, year)
);

-- =====================================================
-- INDEXES
-- =====================================================
-- Existing indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email_verified ON users(email_verified);

CREATE INDEX idx_listings_host ON listings(host_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_views ON listings(views_count DESC);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_listing ON bookings(listing_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Analytics indexes
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_session_date ON analytics_events(session_id, DATE(created_at));
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);

CREATE INDEX idx_analytics_daily_date ON analytics_daily(date);
CREATE INDEX idx_analytics_monthly_year_month ON analytics_monthly(year, month);
CREATE INDEX idx_analytics_yearly_year ON analytics_yearly(year);

CREATE INDEX idx_listing_analytics_daily_listing_date ON listing_analytics_daily(listing_id, date);
CREATE INDEX idx_listing_analytics_monthly_listing_year_month ON listing_analytics_monthly(listing_id, year, month);
CREATE INDEX idx_listing_analytics_yearly_listing_year ON listing_analytics_yearly(listing_id, year);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Update triggers for main tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update triggers for analytics tables
CREATE TRIGGER update_analytics_daily_updated_at BEFORE UPDATE ON analytics_daily
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_monthly_updated_at BEFORE UPDATE ON analytics_monthly
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_yearly_updated_at BEFORE UPDATE ON analytics_yearly
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listing_analytics_daily_updated_at BEFORE UPDATE ON listing_analytics_daily
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listing_analytics_monthly_updated_at BEFORE UPDATE ON listing_analytics_monthly
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listing_analytics_yearly_updated_at BEFORE UPDATE ON listing_analytics_yearly
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update host expiry date
CREATE OR REPLACE FUNCTION update_host_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'host' AND NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    NEW.host_expiry_date = CURRENT_TIMESTAMP + INTERVAL '6 months';
  END IF;
  
  IF NEW.status = 'pending' THEN
    NEW.host_expiry_date = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_host_expiry_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_host_expiry();

-- Function to increment listing views
CREATE OR REPLACE FUNCTION increment_listing_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listings 
  SET views_count = views_count + 1,
      unique_views_count = unique_views_count + 1
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to track listing views from analytics
CREATE TRIGGER track_listing_views
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  WHEN (NEW.event_type = 'listing_view' AND NEW.page_url LIKE '/listings/%')
  EXECUTE FUNCTION increment_listing_views();

-- Function to update daily website analytics
CREATE OR REPLACE FUNCTION update_daily_analytics(target_date DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO analytics_daily (date, total_visits, unique_visitors, page_views, bounce_count)
  SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT session_id) as total_visits,
    COUNT(DISTINCT CASE WHEN user_id IS NOT NULL THEN user_id ELSE session_id END) as unique_visitors,
    COUNT(*) as page_views,
    COUNT(CASE WHEN session_page_count = 1 THEN 1 END) as bounce_count
  FROM (
    SELECT 
      session_id,
      user_id,
      created_at,
      COUNT(*) OVER (PARTITION BY session_id, DATE(created_at)) as session_page_count
    FROM analytics_events
    WHERE DATE(created_at) = target_date
      AND event_type = 'page_view'
  ) subq
  GROUP BY DATE(created_at)
  ON CONFLICT (date) DO UPDATE SET
    total_visits = EXCLUDED.total_visits,
    unique_visitors = EXCLUDED.unique_visitors,
    page_views = EXCLUDED.page_views,
    bounce_count = EXCLUDED.bounce_count,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to update daily listing analytics
CREATE OR REPLACE FUNCTION update_daily_listing_analytics(target_date DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO listing_analytics_daily (listing_id, date, views, unique_views, bookings_count, booking_value)
  SELECT 
    l.id as listing_id,
    target_date as date,
    COUNT(DISTINCT ae.session_id) as views,
    COUNT(DISTINCT ae.user_id) as unique_views,
    COUNT(DISTINCT b.id) as bookings_count,
    COALESCE(SUM(b.total_price), 0) as booking_value
  FROM listings l
  LEFT JOIN analytics_events ae ON ae.page_url LIKE '%' || l.id::text || '%' 
    AND ae.event_type = 'listing_view'
    AND DATE(ae.created_at) = target_date
  LEFT JOIN bookings b ON b.listing_id = l.id 
    AND DATE(b.created_at) = target_date
    AND b.status = 'confirmed'
  GROUP BY l.id
  ON CONFLICT (listing_id, date) DO UPDATE SET
    views = EXCLUDED.views,
    unique_views = EXCLUDED.unique_views,
    bookings_count = EXCLUDED.bookings_count,
    booking_value = EXCLUDED.booking_value,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INSERT ADMIN
-- =====================================================
INSERT INTO users (
  name, 
  email, 
  password_hash, 
  phone_number, 
  role, 
  status, 
  email_verified
) VALUES (
  'Abdurraouf Sadi',
  'abdurraouf@mar-haba.ly',
  '$2b$10$FVWuK/Bzg8zbNisWc86Ja.4kXGPqdGe0jxxp/fm.Y0HJYxFpKKkcS',
  '+218910000001',
  'super_admin',
  'confirmed',
  true
);

-- =====================================================
-- SAMPLE QUERIES FOR ANALYTICS
-- =====================================================

-- Get today's website stats
/*
SELECT * FROM analytics_daily WHERE date = CURRENT_DATE;
*/

-- Get monthly website summary
/*
SELECT * FROM analytics_monthly 
WHERE year = EXTRACT(YEAR FROM CURRENT_DATE) 
ORDER BY month DESC;
*/

-- Get top performing listings this month
/*
SELECT 
  l.title,
  lad.views,
  lad.unique_views,
  lad.bookings_count,
  lad.booking_value,
  lad.view_to_booking_rate
FROM listing_analytics_daily lad
JOIN listings l ON l.id = lad.listing_id
WHERE DATE_TRUNC('month', lad.date) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY l.id, l.title, lad.views, lad.unique_views, lad.bookings_count, lad.booking_value, lad.view_to_booking_rate
ORDER BY lad.booking_value DESC
LIMIT 10;
*/

-- Get listing performance trend
/*
SELECT 
  date,
  views,
  bookings_count,
  booking_value
FROM listing_analytics_daily
WHERE listing_id = 'your-listing-id-here'
  AND date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
*/