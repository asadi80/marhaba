import { NextResponse } from 'next/server';
import pool from '@/lib/postgres';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { sessionId, listingId } = await request.json();
    
    // Get user ID from the token cookie
    let userId = null;
    const token = request.cookies.get('token')?.value;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }
    
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Also get user agent for better tracking
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await pool.query(
      `INSERT INTO analytics_events (
        session_id, user_id, event_type, page_url, ip_address, user_agent, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [sessionId, userId, 'listing_view', `/listings/${listingId}`, ip, userAgent]
    );
    
    return NextResponse.json({ success: true, userId: userId });
  } catch (error) {
    console.error('Listing view tracking error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}