import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

export async function POST(req, { params }) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const result = await pool.query(
      `
      UPDATE listings
      SET view_count = COALESCE(view_count, 0) + 1
      WHERE id = $1
      RETURNING view_count
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Listing not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      views: result.rows[0].view_count,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update views",
      },
      { status: 500 }
    );
  }
}