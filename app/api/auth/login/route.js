// app/api/auth/login/route.js - POSTGRESQL VERSION
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/postgres";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find user - PostgreSQL version
    const result = await pool.query(
      `SELECT id, name, email, password_hash, phone_number, role, status, 
              email_verified, created_at, id_images, host_expiry_date
       FROM users 
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const user = result.rows[0];

    // Check if email is verified
    if (!user.email_verified) {
      const resendUrl = "https://www.mar-haba.ly/resend-verification";
      
      return NextResponse.json(
        {
          message: "Please verify your email address before logging in.",
          htmlMessage: `Please verify your email address before logging in. Check your inbox for the verification link, or <a href="${resendUrl}" target="_blank" style="color: #3B82F6; text-decoration: underline;">click here to resend</a>. <br/><br/> يرجى تأكيد عنوان بريدك الإلكتروني قبل تسجيل الدخول. تحقق من صندوق الوارد الخاص بك للحصول على رابط التأكيد، أو <a href="${resendUrl}" target="_blank" style="color: #3B82F6; text-decoration: underline;">انقر هنا لإعادة الإرسال</a>`,
          requiresVerification: true,
          email: user.email,
          resendLink: resendUrl
        },
        { status: 401 },
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // For hosts: Allow login even if pending, but track their status
    let loginMessage = "Login successful";
    let requiresIdUpload = false;
    let isHostApproved = true;

    if (user.role === "host") {
      // Check if host has uploaded ID images (id_images is an array in PostgreSQL)
      const hasIdImages = user.id_images && user.id_images.length > 0;

      if (user.status === "pending") {
        if (!hasIdImages) {
          // Host hasn't uploaded ID yet - they need to upload
          requiresIdUpload = true;
          loginMessage =
            "Please upload your ID/Passport to complete your host verification";
        } else {
          // Host has uploaded ID but waiting for approval
          loginMessage =
            "Your host account is pending admin approval. Some features are limited until approved.";
          isHostApproved = false;
        }
      } else if (user.status === "suspended") {
        return NextResponse.json(
          {
            message: "Your account has been suspended. Please contact support.",
          },
          { status: 401 },
        );
      }
    }

    // Create token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        requiresIdUpload: requiresIdUpload,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Prepare user response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phone_number,
      status: user.status,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      requiresIdUpload: requiresIdUpload,
      hasIdImages: user.id_images && user.id_images.length > 0,
      isHostApproved: isHostApproved,
      hostExpiryDate: user.host_expiry_date,
    };

    const response = NextResponse.json({
      success: true,
      message: loginMessage,
      user: userResponse,
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
      { status: 500 },
    );
  }
}