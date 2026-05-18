import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/postgres";
import bcrypt from "bcryptjs";
import * as UAParser from "ua-parser-js";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // ─── Validation ─────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // ─── Find user ─────────────────────────────
    const result = await pool.query(
      `
      SELECT id, name, email, password_hash, phone_number, role, status,
             email_verified, created_at, id_images, host_expiry_date
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // ─── Email verification check ─────────────
    if (!user.email_verified) {
      return NextResponse.json(
        {
          message: "Please verify your email address before logging in.",
          requiresVerification: true,
        },
        { status: 401 }
      );
    }

    // ─── Password check ────────────────────────
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ─── Host logic ────────────────────────────
    let loginMessage = "Login successful";
    let requiresIdUpload = false;
    let isHostApproved = true;

    if (user.role === "host") {
      const hasIdImages = user.id_images && user.id_images.length > 0;

      if (user.status === "pending") {
        if (!hasIdImages) {
          requiresIdUpload = true;
          loginMessage =
            "Please upload your ID/Passport to complete verification";
        } else {
          loginMessage =
            "Your host account is pending admin approval.";
          isHostApproved = false;
        }
      } else if (user.status === "suspended") {
        return NextResponse.json(
          { message: "Your account has been suspended." },
          { status: 401 }
        );
      }
    }

    // ─── DEVICE + IP DETECTION (FIXED) ─────────────────
    const userAgentHeader = request.headers.get("user-agent") || "";

const parser = new UAParser.UAParser(userAgentHeader);
const ua = parser.getResult();

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      null;

    const userAgent = userAgentHeader;

    // ─── RESET OLD SESSIONS ───────────────────
    await pool.query(
      `UPDATE user_sessions SET is_active = false WHERE user_id = $1`,
      [user.id]
    );

    // ─── INSERT SESSION ────────────────────────
    await pool.query(
      `
      INSERT INTO user_sessions (
        user_id,
        device,
        browser,
        os,
        ip_address,
        user_agent,
        logged_in_at,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), true)
      `,
      [
        user.id,
        ua.device.type || "desktop",
        ua.browser.name || "unknown",
        ua.os.name || "unknown",
        ip,
        userAgent,
      ]
    );

    // ─── INSERT EVENT ─────────────────────────
    await pool.query(
      `
      INSERT INTO user_events (
        user_id,
        event_type,
        metadata,
        created_at
      )
      VALUES ($1, $2, $3, NOW())
      `,
      [
        user.id,
        "login",
        JSON.stringify({
          ip,
          device: ua.device,
          browser: ua.browser,
          os: ua.os,
        }),
      ]
    );

    // ─── JWT TOKEN ────────────────────────────
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ─── RESPONSE ──────────────────────────────
    const response = NextResponse.json({
      success: true,
      message: loginMessage,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        requiresIdUpload,
        isHostApproved,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}