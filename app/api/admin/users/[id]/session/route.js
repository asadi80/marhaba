import { NextResponse } from "next/server";
import pool from "@/lib/postgres";
import { verifyAdminFromCookie } from "@/lib/adminAuth";

export async function GET(request, { params }) {
  try {
const { id: userId } = await params;
    // verify admin
    const auth = await verifyAdminFromCookie(request, "admin");
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status }
      );
    }

    // get sessions
    const result = await pool.query(
      `SELECT 
        id,
        device,
        browser,
        os,
        ip_address,
        user_agent,
        logged_in_at,
        logged_out_at,
        is_active
       FROM user_sessions
       WHERE user_id = $1
       ORDER BY logged_in_at DESC`,
      [userId]
    );

    const sessions = result.rows.map((s) => ({
      _id: s.id,
      device: s.device,
      browser: s.browser,
      os: s.os,
      ipAddress: s.ip_address,
      userAgent: s.user_agent,
      loggedInAt: s.logged_in_at,
      loggedOutAt: s.logged_out_at,
      isActive: s.is_active,
    }));

    return NextResponse.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("GET user sessions error:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}