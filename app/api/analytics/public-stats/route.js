import { NextResponse } from 'next/server';
import pool from '@/lib/postgres'; // Change this line

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily';
    
    let data = [];
    let summary = {};
    
    // Get daily stats (last 30 days)
    if (period === 'daily') {
      const result = await pool.query(`
        SELECT 
          date,
          total_visits,
          unique_visitors,
          page_views
        FROM analytics_daily
        WHERE date >= CURRENT_DATE - INTERVAL '30 days'
        ORDER BY date ASC
      `);
      data = result.rows;
    }
    
    // Get monthly stats (current year)
    if (period === 'monthly') {
      const result = await pool.query(`
        SELECT 
          year,
          month,
          total_visits,
          unique_visitors,
          total_page_views
        FROM analytics_monthly
        WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)
        ORDER BY month ASC
      `);
      data = result.rows;
    }
    
    // Get yearly stats (last 5 years)
    if (period === 'yearly') {
      const result = await pool.query(`
        SELECT 
          year,
          total_visits,
          unique_visitors,
          total_page_views
        FROM analytics_yearly
        ORDER BY year DESC
        LIMIT 5
      `);
      data = result.rows;
    }
    
    // Get summary for everyone
    const summaryResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM analytics_events WHERE event_type = 'page_view' AND created_at >= CURRENT_DATE) as today_views,
        (SELECT COUNT(DISTINCT session_id) FROM analytics_events WHERE created_at >= CURRENT_DATE) as today_visitors,
        (SELECT COUNT(*) FROM analytics_events WHERE event_type = 'page_view' AND created_at >= CURRENT_DATE - INTERVAL '7 days') as week_views,
        (SELECT COUNT(DISTINCT session_id) FROM analytics_events WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_visitors,
        (SELECT COUNT(*) FROM analytics_events WHERE event_type = 'page_view' AND created_at >= CURRENT_DATE - INTERVAL '30 days') as month_views,
        (SELECT COUNT(DISTINCT session_id) FROM analytics_events WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as month_visitors
    `);
    
    summary = summaryResult.rows[0];
    
    return NextResponse.json({
      summary,
      data,
      period
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}