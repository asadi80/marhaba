// app/api/stats/simple/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

export async function GET(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

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

    return NextResponse.json({
      success: true,
      data: {
        total_users: parseInt(result.rows[0].total_users),
        total_hosts: parseInt(result.rows[0].total_hosts),
        active_hosts: parseInt(result.rows[0].active_hosts),
        total_listings: parseInt(result.rows[0].total_listings),
        total_bookings: parseInt(result.rows[0].total_bookings),
        confirmed_bookings: parseInt(result.rows[0].confirmed_bookings),
        total_travelers: parseInt(result.rows[0].total_travelers),
      },
    });
  } catch (error) {
    console.error("Error fetching simple stats:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch statistics",
      },
      { status: 500 }
    );
  }
}