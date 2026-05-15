// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
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

    await connectToDatabase();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Check if email is verified
 // Check if email is verified
if (!user.emailVerified) {
  return NextResponse.json(
    {
      message: "Please verify your email address before logging in. Check your inbox for the verification link, or click here to resend: https://www.mar-haba.ly/resend-verification. يرجى تأكيد عنوان بريدك الإلكتروني قبل تسجيل الدخول. تحقق من صندوق الوارد الخاص بك للحصول على رابط التأكيد، أو انقر هنا لإعادة الإرسال: https://www.mar-haba.ly/resend-verification",
      htmlMessage: `Please verify your email address before logging in. Check your inbox for the verification link, or <a href="https://www.mar-haba.ly/resend-verification?email=${encodeURIComponent(user.email)}" target="_blank" style="color: #3B82F6; text-decoration: underline;">click here to resend</a>. يرجى تأكيد عنوان بريدك الإلكتروني قبل تسجيل الدخول. تحقق من صندوق الوارد الخاص بك للحصول على رابط التأكيد، أو <a href="https://www.mar-haba.ly/resend-verification?email=${encodeURIComponent(user.email)}" target="_blank" style="color: #3B82F6; text-decoration: underline;">انقر هنا لإعادة الإرسال</a>`,
      requiresVerification: true,
      email: user.email,
      resendLink: `https://www.mar-haba.ly/resend-verification?email=${encodeURIComponent(user.email)}`
    },
    { status: 401 },
  );
}

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
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
      // Check if host has uploaded ID images
      const hasIdImages = user.idImages && user.idImages.length > 0;

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
        userId: user._id,
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
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      requiresIdUpload: requiresIdUpload,
      hasIdImages: user.idImages && user.idImages.length > 0,
      isHostApproved: isHostApproved,
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