import { NextResponse } from "next/server";
import pool from "@/lib/postgres";
import { verifyAdminFromCookie } from "@/lib/adminAuth";

export async function GET(request, { params }) {
  console.log("event route was called");

  try {
    const { id: userId } = await params;

    const auth = await verifyAdminFromCookie(request, "admin");
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status }
      );
    }

    const result = await pool.query(
      `
      SELECT id, event_type, metadata, created_at
      FROM user_events
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    const events = result.rows.map((e) => ({
      _id: e.id,
      type: e.event_type,
      metadata: e.metadata,
      createdAt: e.created_at,
    }));

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("GET user events error:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}