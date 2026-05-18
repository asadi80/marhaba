// app/api/analytics/listing-view/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/postgres';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { sessionId, listingId } = await request.json();
    
    // ✅ MATCH YOUR AUTH ME ROUTE - read 'token' cookie
    const token = request.cookies.get('token')?.value;
    
    let userId = null;
    if (token) {
      try {
        // ✅ SAME VERIFICATION as your auth/me route
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
        console.log('✅ Tracking view for user:', userId);
      } catch (err) {
        console.error('Token verification failed:', err.message);
      }
    }
    
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const result = await pool.query(
      `INSERT INTO analytics_events (
        session_id, user_id, event_type, page_url, ip_address, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
      [sessionId, userId, 'listing_view', `/listings/${listingId}`, ip]
    );
    
    console.log('✅ Listing view recorded:', { 
      listingId, 
      userId: userId || 'anonymous', 
      recordId: result.rows[0]?.id 
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Listing view tracking error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}