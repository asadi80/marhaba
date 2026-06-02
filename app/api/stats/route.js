// app/api/stats/simple/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

export async function GET(request) {
  try {
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'host') as total_hosts,
        (SELECT COUNT(*) FROM users WHERE role = 'host' 
          AND status = 'confirmed'
          AND EXISTS (
            SELECT 1 FROM listings 
            WHERE host_id = users.id 
            AND status = 'active'
          )
        ) as active_hosts,
        (SELECT COUNT(*) FROM listings WHERE status = 'active') as total_listings,
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') as confirmed_bookings,
        (SELECT COUNT(DISTINCT user_id) FROM bookings WHERE status = 'confirmed') as total_travelers
    `);

    const row = result.rows[0];
    
    return NextResponse.json({
      success: true,
      data: {
        total_users: parseInt(row.total_users) || 0,
        total_hosts: parseInt(row.total_hosts) || 0,
        active_hosts: parseInt(row.active_hosts) || 0,
        total_listings: parseInt(row.total_listings) || 0,
        total_bookings: parseInt(row.total_bookings) || 0,
        confirmed_bookings: parseInt(row.confirmed_bookings) || 0,
        total_travelers: parseInt(row.total_travelers) || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching simple stats:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch statistics",
        error: error.message,
      },
      { status: 500 }
    );
  }
}