// lib/db.js
import pool from './postgres';

export const db = {
  // User queries
  async findUserByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },
  
  async findUserById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },
  
  async createUser(userData) {
    const { name, email, password_hash, phone_number, role, status } = userData;
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone_number, role, status, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, phone_number, role, status, created_at`,
      [name, email, password_hash, phone_number, role, status, false]
    );
    return result.rows[0];
  },
  
  async updateUserStatus(userId, status, statusReason = null) {
    const result = await pool.query(
      `UPDATE users 
       SET status = $1, status_reason = COALESCE($2, status_reason), updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, statusReason, userId]
    );
    return result.rows[0];
  },
  
  // Listing queries
  async findListingsByHost(hostId) {
    const result = await pool.query(
      'SELECT * FROM listings WHERE host_id = $1 ORDER BY created_at DESC',
      [hostId]
    );
    return result.rows;
  },
  
  async createListing(listingData) {
    const { title, description, price, location, latitude, longitude, images, category, amenities, host_id, rules } = listingData;
    const result = await pool.query(
      `INSERT INTO listings (title, description, price, location, latitude, longitude, images, category, amenities, host_id, rules)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [title, description, price, location, latitude, longitude, images, category, amenities, host_id, rules]
    );
    return result.rows[0];
  },
  
  // Booking queries
  async findBookingsByUser(userId) {
    const result = await pool.query(
      `SELECT b.*, l.title as listing_title, l.images as listing_images
       FROM bookings b
       JOIN listings l ON b.listing_id = l.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return result.rows;
  },
  
  async createBooking(bookingData) {
    const { listing_id, user_id, check_in, check_out, total_price, guests } = bookingData;
    const result = await pool.query(
      `INSERT INTO bookings (listing_id, user_id, check_in, check_out, total_price, guests)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [listing_id, user_id, check_in, check_out, total_price, guests]
    );
    return result.rows[0];
  }
};