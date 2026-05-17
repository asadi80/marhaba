import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { sessionId, listingId } = await request.json();
    
    // Get user ID from token (optional - tracks even for non-logged in users)
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded) userId = decoded.userId;
    }
    
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    await query(
      `INSERT INTO analytics_events (
        session_id, user_id, event_type, page_url, ip_address, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())`,
      [sessionId, userId, 'listing_view', `/listings/${listingId}`, ip]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Listing view tracking error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}