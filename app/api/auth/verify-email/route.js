// app/api/auth/verify-email/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || "https://marhaba-three.vercel.app"}/verification-result?error=invalid-token`
      );
    }

    await connectToDatabase();

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || "https://marhaba-three.vercel.app"}/verification-result?error=invalid-expired`
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
    
    await user.save();

    // Redirect to login page with success message
    const redirectUrl = `${process.env.NEXTAUTH_URL || "https://marhaba-three.vercel.app"}/verification-result?verified=true&role=${user.role}`;
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || "https://marhaba-three.vercel.app"}/verification-result?error=server-error`
    );
  }
}