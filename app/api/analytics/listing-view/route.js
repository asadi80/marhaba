import { NextResponse } from 'next/server';
import pool from '@/lib/postgres'; // Change this line

export async function POST(request) {
  try {
    const { sessionId, listingId } = await request.json();
    
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    await pool.query(
      `INSERT INTO analytics_events (
        session_id, user_id, event_type, page_url, ip_address, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())`,
      [sessionId, null, 'listing_view', `/listings/${listingId}`, ip]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Listing view tracking error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}