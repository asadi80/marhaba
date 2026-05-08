// app/api/auth/verify-email/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Verification token is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired verification token. Please request a new verification email." },
        { status: 400 }
      );
    }

    // Update user email verification status
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    
    // For regular users, auto-confirm their account
    if (user.role === "user") {
      user.status = "confirmed";
    }
    // For hosts, keep as pending until admin approval
    // Admin will manually change status to "confirmed" after review
    
    await user.save();

    return NextResponse.json({
      success: true,
      message: user.role === "host" 
        ? "Email verified successfully! Your host account is now pending admin approval. You will receive an email once approved."
        : "Email verified successfully! You can now log in to your account.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}