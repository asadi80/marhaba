-- =====================================================
-- COMPLETE RESET: Drop all tables (in correct order)
-- =====================================================

-- DROP TABLE IF EXISTS bookings CASCADE;
-- DROP TABLE IF EXISTS listings CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

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
-- USERS user_sessions TABLE
-- =====================================================

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  device VARCHAR(255),
  browser VARCHAR(255),
  os VARCHAR(255),

  ip_address TEXT,

  user_agent TEXT,

  logged_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logged_out_at TIMESTAMP,

  is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- USERS user_events TABLE
-- =====================================================

CREATE TABLE user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  event_type TEXT, -- login, view_listing, booking_created, etc
  metadata JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  blocked_dates JSONB DEFAULT '[]',
  view_count INTEGER DEFAULT 0,
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
  check_in TIMESTAMP NOT NULL,  -- Now includes time
  check_out TIMESTAMP NOT NULL, -- Now includes time
  total_price DECIMAL(10, 2) NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  CHECK (check_in < check_out)
);

-- =====================================================
-- INDEXES
-- =====================================================
-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email_verified ON users(email_verified);

-- Listings indexes
CREATE INDEX idx_listings_host ON listings(host_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_category ON listings(category);

-- Bookings indexes
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_listing_dates ON bookings(listing_id, check_in, check_out);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update updated_at column function
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

-- =====================================================
-- INSERT ADMIN
-- =====================================================
-- INSERT INTO users (
--   name, 
--   email, 
--   password_hash, 
--   phone_number, 
--   role, 
--   status, 
--   email_verified
-- ) VALUES (
--   'Abdurraouf Sadi',
--   'abdurraouf@mar-haba.ly',
--   '$2b$10$FVWuK/Bzg8zbNisWc86Ja.4kXGPqdGe0jxxp/fm.Y0HJYxFpKKkcS',
--   '+218910000001',
--   'super_admin',
--   'confirmed',
--   true
-- );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;