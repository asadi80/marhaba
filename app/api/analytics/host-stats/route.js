import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 });
    }
    
    // Verify token and get user
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Get user details with role
    const userResult = await query(
      `SELECT id, role FROM users WHERE id = $1`,
      [decoded.userId]
    );
    
    const user = userResult.rows[0];
    
    // Check if user is host or admin
    if (!user || (user.role !== 'host' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Access denied - Host only' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    const period = searchParams.get('period') || 'daily';
    
    let query_text = '';
    let params = [];
    
    // If admin, can see all listings or specific one
    // If host, only see their own listings
    if (user.role === 'admin' && listingId) {
      params = [listingId];
    } else if (user.role === 'host') {
      // Get host's listings first
      const listingsResult = await query(
        `SELECT id FROM listings WHERE host_id = $1`,
        [user.id]
      );
      const listingIds = listingsResult.rows.map(r => r.id);
      
      if (listingIds.length === 0) {
        return NextResponse.json({ 
          message: 'No listings found',
          stats: [] 
        });
      }
      
      params = [listingIds];
      query_text = `WHERE listing_id = ANY($1::uuid[])`;
    }
    
    // Get analytics based on period
    let stats = [];
    
    if (period === 'daily') {
      const result = await query(`
        SELECT 
          l.title,
          lad.date,
          lad.views,
          lad.unique_views,
          lad.bookings_count,
          lad.booking_value
        FROM listing_analytics_daily lad
        JOIN listings l ON l.id = lad.listing_id
        ${query_text}
        AND lad.date >= CURRENT_DATE - INTERVAL '30 days'
        ORDER BY lad.date DESC
      `, params);
      stats = result.rows;
    } else if (period === 'monthly') {
      const result = await query(`
        SELECT 
          l.title,
          lam.year,
          lam.month,
          lam.total_views,
          lam.total_unique_views,
          lam.total_bookings,
          lam.total_booking_value,
          lam.occupancy_rate
        FROM listing_analytics_monthly lam
        JOIN listings l ON l.id = lam.listing_id
        ${query_text}
        AND lam.year = EXTRACT(YEAR FROM CURRENT_DATE)
        ORDER BY lam.year DESC, lam.month DESC
      `, params);
      stats = result.rows;
    }
    
    // Get summary for host's listings
    const summaryResult = await query(`
      SELECT 
        SUM(lad.views) as total_views,
        SUM(lad.unique_views) as total_unique_views,
        SUM(lad.bookings_count) as total_bookings,
        SUM(lad.booking_value) as total_revenue
      FROM listing_analytics_daily lad
      JOIN listings l ON l.id = lad.listing_id
      ${query_text}
      AND lad.date >= CURRENT_DATE - INTERVAL '30 days'
    `, params);
    
    return NextResponse.json({
      stats,
      summary: summaryResult.rows[0],
      period,
      isHost: user.role === 'host',
      isAdmin: user.role === 'admin'
    });
  } catch (error) {
    console.error('Error fetching host stats:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}