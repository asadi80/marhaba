// app/api/analytics/page-view/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/postgres';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { sessionId, path, referrer, userAgent, screenWidth, screenHeight } = await request.json();
    
    // ✅ READ 'token' cookie (not 'auth_token')
    const token = request.cookies.get('token')?.value;
    
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {
        console.error('Token verification failed:', err.message);
      }
    }
    
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    let deviceType = 'desktop';
    if (userAgent) {
      if (/(mobile|android|iphone)/i.test(userAgent)) deviceType = 'mobile';
      if (/(tablet|ipad)/i.test(userAgent)) deviceType = 'tablet';
    }
    
    let browser = 'unknown';
    if (userAgent) {
      if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Safari')) browser = 'Safari';
      else if (userAgent.includes('Edge')) browser = 'Edge';
    }
    
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