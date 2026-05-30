// app/api/host/blocked-users/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/postgres";

function getHostId(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
}

// GET — list all users blocked by this host
export async function GET(request) {
  const hostId = getHostId(request);
  if (!hostId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { rows } = await pool.query(
    `SELECT hbu.id, hbu.user_id, hbu.host_id, hbu.booking_id, hbu.reason, hbu.created_at,
            u.name AS user_name, u.email AS user_email, u.phone_number AS user_phone
     FROM host_blocked_users hbu
     JOIN users u ON hbu.user_id = u.id
     WHERE hbu.host_id = $1
     ORDER BY hbu.created_at DESC`,
    [hostId]
  );

  return NextResponse.json({ blockedUsers: rows });
}

// DELETE — unblock a user
export async function DELETE(request) {
  const hostId = getHostId(request);
  if (!hostId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ message: "userId is required" }, { status: 400 });

  const { rowCount } = await pool.query(
    `DELETE FROM host_blocked_users WHERE host_id = $1 AND user_id = $2`,
    [hostId, userId]
  );

  if (rowCount === 0)
    return NextResponse.json({ message: "Block record not found" }, { status: 404 });

  return NextResponse.json({ message: "User unblocked successfully" });
}