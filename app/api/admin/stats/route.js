// app/api/admin/stats/route.js - POSTGRESQL VERSION
import { NextResponse } from 'next/server';
import pool from '@/lib/postgres';
import { verifyAdminFromCookie } from '@/lib/adminAuth';

export async function GET(request) {
  try {
    // Verify admin using cookie from imported helper
    const auth = await verifyAdminFromCookie(request, 'admin');
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }
    
    // Run all queries in parallel for better performance
    const [
      totalUsersResult,
      totalHostsResult,
      totalAdminsResult,
      totalSuperAdminsResult,
      totalListingsResult,
      totalBookingsResult,
      pendingHostsResult,
      confirmedBookingsResult,
      totalRevenueResult,
      recentBookingsResult,
      recentUsersResult
    ] = await Promise.all([
      // Total users
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'user'`),
      // Total hosts
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'host'`),
      // Total admins
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'admin'`),
      // Total super admins
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'super_admin'`),
      // Total listings
      pool.query(`SELECT COUNT(*) FROM listings`),
      // Total bookings
      pool.query(`SELECT COUNT(*) FROM bookings`),
      // Pending hosts
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'host' AND status = 'pending'`),
      // Confirmed bookings
      pool.query(`SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'`),
      // Total revenue
      pool.query(`SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE status = 'confirmed'`),
      // Recent bookings (with user and listing info)
      pool.query(`
        SELECT b.*, 
               u.name as user_name, u.email as user_email,
               l.title as listing_title
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN listings l ON b.listing_id = l.id
        ORDER BY b.created_at DESC
        LIMIT 5
      `),
      // Recent users (without password)
      pool.query(`
        SELECT id, name, email, phone_number, role, status, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 5
      `)
    ]);
    
    // Extract values from results
    const totalUsers = parseInt(totalUsersResult.rows[0]?.count || 0);
    const totalHosts = parseInt(totalHostsResult.rows[0]?.count || 0);
    const totalAdmins = parseInt(totalAdminsResult.rows[0]?.count || 0);
    const totalSuperAdmins = parseInt(totalSuperAdminsResult.rows[0]?.count || 0);
    const totalListings = parseInt(totalListingsResult.rows[0]?.count || 0);
    const totalBookings = parseInt(totalBookingsResult.rows[0]?.count || 0);
    const pendingHosts = parseInt(pendingHostsResult.rows[0]?.count || 0);
    const confirmedBookings = parseInt(confirmedBookingsResult.rows[0]?.count || 0);
    const totalRevenue = parseFloat(totalRevenueResult.rows[0]?.total || 0);
    
    // Format recent bookings
    const recentBookings = recentBookingsResult.rows.map(booking => ({
      id: booking.id,
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      totalPrice: booking.total_price,
      guests: booking.guests,
      status: booking.status,
      createdAt: booking.created_at,
      user: {
        name: booking.user_name,
        email: booking.user_email
      },
      listing: {
        title: booking.listing_title
      }
    }));
    
    // Format recent users
    const recentUsers = recentUsersResult.rows.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone_number,
      role: user.role,
      status: user.status,
      createdAt: user.created_at
    }));
    
    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalHosts,
        totalAdmins,
        totalSuperAdmins,
        totalListings,
        totalBookings,
        pendingHosts,
        confirmedBookings,
        totalRevenue,
        recentBookings,
        recentUsers,
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}