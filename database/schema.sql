-- =====================================================
-- FULL SCHEMA — mar-haba.ly
-- Run this on a FRESH database only.
-- For existing databases, use migration.sql instead.
-- =====================================================


-- =====================================================
-- RESET (uncomment to wipe everything)
-- =====================================================
-- DROP TABLE IF EXISTS booking_payments CASCADE;
-- DROP TABLE IF EXISTS host_payment_methods CASCADE;
-- DROP TABLE IF EXISTS host_blocked_users CASCADE;
-- DROP TABLE IF EXISTS bookings CASCADE;
-- DROP TABLE IF EXISTS listings CASCADE;
-- DROP TABLE IF EXISTS user_events CASCADE;
-- DROP TABLE IF EXISTS user_sessions CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;


-- =====================================================
-- 1. FUNCTIONS (must come before triggers)
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_host_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'host' AND NEW.status = 'confirmed'
     AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    NEW.host_expiry_date = CURRENT_TIMESTAMP + INTERVAL '6 months';
  END IF;

  IF NEW.status = 'pending' THEN
    NEW.host_expiry_date = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- 2. TABLES
-- =====================================================

-- USERS
CREATE TABLE users (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                        VARCHAR(255) NOT NULL,
  email                       VARCHAR(255) UNIQUE NOT NULL,
  password_hash               VARCHAR(255) NOT NULL,
  phone_number                VARCHAR(50)  NOT NULL,
  role                        VARCHAR(50)  DEFAULT 'user',
  status                      VARCHAR(50)  DEFAULT 'pending',
  status_reason               TEXT,
  host_expiry_date            TIMESTAMP,
  email_verified              BOOLEAN      DEFAULT false,
  email_verification_token    VARCHAR(255),
  email_verification_expires  TIMESTAMP,
  reset_password_token        VARCHAR(255),
  reset_password_expires      TIMESTAMP,
  last_active                 TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  created_at                  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at                  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  host_details  JSONB DEFAULT '{"rating": 0, "totalListings": 0, "verified": false, "notificationSent": {"oneWeek": false, "twoDays": false}}',
  user_details  JSONB DEFAULT '{"preferences": {}, "bookings": []}',
  id_images     TEXT[] DEFAULT ARRAY[]::TEXT[],
  CHECK (role   IN ('user', 'host', 'admin', 'super_admin')),
  CHECK (status IN ('pending', 'confirmed', 'suspended'))
);

-- USER SESSIONS
CREATE TABLE user_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  device        VARCHAR(255),
  browser       VARCHAR(255),
  os            VARCHAR(255),
  ip_address    TEXT,
  user_agent    TEXT,
  logged_in_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logged_out_at TIMESTAMP,
  is_active     BOOLEAN   DEFAULT true
);

-- USER EVENTS
CREATE TABLE user_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type  TEXT,   -- login, view_listing, booking_created, etc.
  metadata    JSONB,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LISTINGS
CREATE TABLE listings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(255)    NOT NULL,
  description   TEXT            NOT NULL,
  price         DECIMAL(10, 2)  NOT NULL,
  location      VARCHAR(255)    NOT NULL,
  latitude      DECIMAL(10, 8),
  longitude     DECIMAL(11, 8),
  images        TEXT[]          NOT NULL DEFAULT ARRAY[]::TEXT[],
  category      VARCHAR(50)     NOT NULL DEFAULT 'city',
  amenities     TEXT[]          DEFAULT ARRAY[]::TEXT[],
  host_id       UUID            REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  rules         TEXT[]          DEFAULT ARRAY[]::TEXT[],
  cancellation_policy TEXT      DEFAULT 'flexible',
  status        VARCHAR(20)     DEFAULT 'active',
  is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
  blocked_dates JSONB           DEFAULT '[]',
  view_count    INTEGER         DEFAULT 0,
  created_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  CHECK (category IN ('beachfront', 'mountain', 'city', 'countryside', 'pool', 'desert', 'camping', 'cabins')),
  CHECK (status   IN ('active', 'suspended', 'deleted'))
);

-- BOOKINGS
CREATE TABLE bookings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID           REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID           REFERENCES users(id)    ON DELETE CASCADE NOT NULL,
  check_in    TIMESTAMP      NOT NULL,
  check_out   TIMESTAMP      NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  guests      INTEGER        NOT NULL DEFAULT 1,
    -- Guest arrival tracking
  checked_in_at   TIMESTAMP,
  checked_out_at  TIMESTAMP,
  no_show         BOOLEAN DEFAULT fals
  status      VARCHAR(20)    DEFAULT 'pending',
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  CHECK (check_in < check_out)
);

-- HOST BLOCKED USERS
CREATE TABLE host_blocked_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id    UUID REFERENCES users(id)    ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id)    ON DELETE CASCADE,
  reason     VARCHAR(50) NOT NULL,        -- 'no_show', 'cancellation', 'manual'
  booking_id UUID REFERENCES bookings(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(host_id, user_id)
);

-- HOST PAYMENT METHODS
CREATE TABLE host_payment_methods (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id              UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type                 VARCHAR(20)  NOT NULL,
  sadad_number         VARCHAR(50),           -- required when type = 'sadad'
  sadad_account_name   VARCHAR(255),          -- display name on Sadad account
  instructions         TEXT,                  -- e.g. "Pay cash on check-in"
  is_active            BOOLEAN      DEFAULT true,
  created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  CHECK (type IN ('cash', 'sadad')),
  CHECK (type != 'sadad' OR sadad_number IS NOT NULL)
);

-- BOOKING PAYMENTS
CREATE TABLE booking_payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            UUID           REFERENCES bookings(id)             ON DELETE CASCADE NOT NULL,
  payment_method_id     UUID           REFERENCES host_payment_methods(id),
  type                  VARCHAR(20)    NOT NULL,
  amount                DECIMAL(10, 2) NOT NULL,
  status                VARCHAR(20)    DEFAULT 'pending',
  sadad_reference       VARCHAR(100),          -- reference number guest uses to pay
  sadad_transaction_id  VARCHAR(255),          -- returned by Sadad after payment
  paid_at               TIMESTAMP,
  notes                 TEXT,
  created_at            TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  CHECK (type   IN ('cash', 'sadad')),
  CHECK (status IN ('pending', 'paid', 'failed', 'refunded'))
);


-- =====================================================
-- 3. INDEXES
-- =====================================================

-- Users
CREATE INDEX idx_users_email          ON users(email);
CREATE INDEX idx_users_role           ON users(role);
CREATE INDEX idx_users_status         ON users(status);
CREATE INDEX idx_users_email_verified ON users(email_verified);

-- Listings
CREATE INDEX idx_listings_host        ON listings(host_id);
CREATE INDEX idx_listings_status      ON listings(status);
CREATE INDEX idx_listings_category    ON listings(category);

-- Bookings
CREATE INDEX idx_bookings_user         ON bookings(user_id);
CREATE INDEX idx_bookings_listing_dates ON bookings(listing_id, check_in, check_out);
CREATE INDEX idx_bookings_dates        ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_status       ON bookings(status);

-- Host payment methods
CREATE INDEX idx_host_payment_methods_host   ON host_payment_methods(host_id);
CREATE INDEX idx_host_payment_methods_active ON host_payment_methods(host_id, is_active);

-- Booking payments
CREATE INDEX idx_booking_payments_booking    ON booking_payments(booking_id);
CREATE INDEX idx_booking_payments_status     ON booking_payments(status);
CREATE INDEX idx_booking_payments_sadad_ref  ON booking_payments(sadad_reference);


-- =====================================================
-- 4. TRIGGERS
-- =====================================================

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_host_payment_methods_updated_at
  BEFORE UPDATE ON host_payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_payments_updated_at
  BEFORE UPDATE ON booking_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_host_expiry_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_host_expiry();


-- =====================================================
-- 5. ADMIN SEED (uncomment to insert)
-- =====================================================
-- INSERT INTO users (
--   name, email, password_hash, phone_number,
--   role, status, email_verified
-- ) VALUES (
--   'Abdurraouf Sadi',
--   'abdurraouf@mar-haba.ly',
--   '$2b$10$FVWuK/Bzg8zbNisWc86Ja.4kXGPqdGe0jxxp/fm.Y0HJYxFpKKkcS',
--   '+218910000001',
--   'super_admin', 'confirmed', true
-- );


-- =====================================================
-- 6. VERIFY
-- =====================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;