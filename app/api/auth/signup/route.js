// app/api/auth/signup/route.js - POSTGRESQL VERSION
import { NextResponse } from "next/server";
import pool from "@/lib/postgres";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/sendEmail";
import crypto from "crypto";

export async function POST(request) {
  try {
    const {
      name,
      email,
      password,
      phoneNumber,
      userType = "user",
    } = await request.json();

    // Validation
    if (!name || !email || !password || !phoneNumber) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    if (!["user", "host"].includes(userType)) {
      return NextResponse.json(
        { message: "Invalid user type" },
        { status: 400 },
      );
    }

    // Check if user already exists - PostgreSQL version
    const existingUser = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Prepare user data based on role
    let hostDetails = null;
    let userDetails = null;

    if (userType === "host") {
      hostDetails = {
        rating: 0,
        totalListings: 0,
        verified: false,
        joinedDate: new Date(),
        notificationSent: {
          oneWeek: false,
          twoDays: false,
        },
      };
    } else {
      userDetails = {
        bookings: [],
        preferences: {},
        memberSince: new Date(),
      };
    }

    // Create user - PostgreSQL version
    const result = await pool.query(
      `INSERT INTO users (
        name, email, password_hash, phone_number, role, status, 
        email_verified, email_verification_token, email_verification_expires,
        host_details, user_details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, name, email, phone_number, role, status, email_verified, created_at`,
      [
        name,
        email,
        hashedPassword,
        phoneNumber,
        userType,
        "pending", // status
        false, // email_verified
        emailVerificationToken,
        emailVerificationExpires,
        hostDetails,
        userDetails,
      ]
    );

    const user = result.rows[0];

    // Create verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL || "https://marhaba-three.vercel.app"}/api/auth/verify-email?token=${emailVerificationToken}`;

    // Send verification email
    const emailHtml = `
<div style="font-family: Arial, 'Cairo', 'Tajawal', sans-serif; max-width: 600px; margin: auto; padding: 20px;">
  
  <!-- English Section -->
  <div style="margin-bottom: 30px;">
    <h2 style="color: #4F46E5;">✓ Welcome to Marhaba!</h2>
    
    <p>Hi ${name},</p>
    
    <p>Thank you for registering with Marhaba! Please verify your email address to complete your registration.</p>
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <a href="${verificationUrl}" 
         style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Verify Email Address →
      </a>
    </div>
    
    <p>Or copy and paste this link in your browser:</p>
    <p style="background: #e5e7eb; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">${verificationUrl}</p>
    
    <p>This link will expire in 24 hours.</p>
    
    ${
      userType === "host"
        ? `
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="color: #92400e; margin: 0;">
        <strong>📝 Note for Hosts:</strong> After email verification, your account will be reviewed by our team. 
        You will receive another email once your host account is approved.
      </p>
    </div>
    `
        : ""
    }
    
    <p style="margin-top: 20px;">Best regards,<br/>Marhaba Team</p>
  </div>
  
  <div style="border-top: 2px solid #e5e7eb; margin: 20px 0;"></div>
  
  <!-- Arabic Section -->
  <div style="direction: rtl; text-align: right;">
    <h2 style="color: #4F46E5;">✓ مرحباً بك في مرحبا!</h2>
    
    <p>مرحباً ${name}،</p>
    
    <p>شكراً لتسجيلك مع مرحبا! يرجى تأكيد عنوان بريدك الإلكتروني لإكمال تسجيلك.</p>
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <a href="${verificationUrl}" 
         style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
        تأكيد البريد الإلكتروني ←
      </a>
    </div>
    
    <p>أو انسخ هذا الرابط والصقه في المتصفح:</p>
    <p style="background: #e5e7eb; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">${verificationUrl}</p>
    
    <p>هذا الرابط سينتهي صلاحيته خلال 24 ساعة.</p>
    
    ${
      userType === "host"
        ? `
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="color: #92400e; margin: 0;">
        <strong>📝 ملاحظة للمضيفين:</strong> بعد تأكيد البريد الإلكتروني، سيتم مراجعة حسابك من قبل فريقنا. 
        ستتلقى رسالة إلكترونية أخرى بعد الموافقة على حساب المضيف الخاص بك.
      </p>
    </div>
    `
        : ""
    }
    
    <p style="margin-top: 20px;">مع أطيب التحيات،<br/>فريق مرحبا</p>
  </div>
</div>
    `;

    try {
      await sendEmail({
        to: email,
        subject:
          "Welcome to Marhaba! Please verify your email / مرحباً بك في مرحبا! يرجى تأكيد بريدك الإلكتروني",
        text: `Welcome to Marhaba! Please verify your email by clicking this link: ${verificationUrl}`,
        html: emailHtml,
      });
      console.log("Verification email sent to:", email);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail the registration if email fails, but log it
    }

    // Prepare user response (without password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phone_number,
      status: user.status,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Please verify your email.",
        user: userResponse,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}