import { NextResponse } from 'next/server';
import pool from '@/lib/postgres';

export async function POST(request) {
  try {
    const { sessionId, eventType, metadata } = await request.json();
    
    await pool.query(
      `INSERT INTO analytics_events (
        session_id, event_type, metadata, created_at
      ) VALUES ($1, $2, $3, NOW())`,
      [sessionId, eventType, JSON.stringify(metadata || {})]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Event tracking error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}