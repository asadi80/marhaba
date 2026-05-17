import { NextResponse } from 'next/server';
import pool from '@/lib/postgres'; // Change this line
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { sessionId, path, referrer, userAgent, screenWidth, screenHeight } = await request.json();
    
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }
    
    // Alternative: Check cookie directly
    const cookieToken = request.cookies.get('token')?.value; // Changed from 'auth_token' to 'token' to match your login route
    if (!userId && cookieToken) {
      const decoded = verifyToken(cookieToken);
      if (decoded) {
        userId = decoded.userId;
      }
    }
    
    // Get IP address
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Device detection
    let deviceType = 'desktop';
    if (userAgent) {
      if (/(mobile|android|iphone)/i.test(userAgent)) deviceType = 'mobile';
      if (/(tablet|ipad)/i.test(userAgent)) deviceType = 'tablet';
    }
    
    // Browser detection
    let browser = 'unknown';
    if (userAgent) {
      if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Safari')) browser = 'Safari';
      else if (userAgent.includes('Edge')) browser = 'Edge';
    }
    
    // Insert analytics event using pool.query
    await pool.query(
      `INSERT INTO analytics_events (
        session_id, user_id, event_type, page_url, referrer_url,
        user_agent, ip_address, device_type, browser, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [sessionId, userId, 'page_view', path, referrer, userAgent, ip, deviceType, browser]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Page view tracking error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}