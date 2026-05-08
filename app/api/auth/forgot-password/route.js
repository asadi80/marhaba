// app/api/auth/forgot-password/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email });

    // For security, don't reveal if user exists or not
    if (!user) {
      return NextResponse.json({
        message: "If your email is registered, you will receive a password reset link",
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'https://marhaba-three.vercel.app'}/reset-password?token=${resetToken}`;

    // Send reset email
    const emailHtml = `
<div style="font-family: Arial, 'Cairo', 'Tajawal', sans-serif; max-width: 600px; margin: auto; padding: 20px;">
  
  <!-- English Section -->
  <div style="margin-bottom: 30px;">
    <h2 style="color: #4F46E5;">🔐 Reset Your Password</h2>
    
    <p>Hi ${user.name},</p>
    
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <a href="${resetUrl}" 
         style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Reset Password →
      </a>
    </div>
    
    <p>Or copy and paste this link in your browser:</p>
    <p style="background: #e5e7eb; padding: 10px; border-radius: 5px; word-break: break-all;">${resetUrl}</p>
    
    <p>This link will expire in 1 hour.</p>
    
    <p>If you didn't request this, please ignore this email.</p>
    
    <p style="margin-top: 20px;">Best regards,<br/>Marhaba Team</p>
  </div>
  
  <div style="border-top: 2px solid #e5e7eb; margin: 20px 0;"></div>
  
  <!-- Arabic Section -->
  <div style="direction: rtl; text-align: right;">
    <h2 style="color: #4F46E5;">🔐 إعادة تعيين كلمة المرور</h2>
    
    <p>مرحباً ${user.name}،</p>
    
    <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. انقر على الزر أدناه لإنشاء كلمة مرور جديدة:</p>
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <a href="${resetUrl}" 
         style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
        إعادة تعيين كلمة المرور ←
      </a>
    </div>
    
    <p>أو انسخ هذا الرابط والصقه في المتصفح:</p>
    <p style="background: #e5e7eb; padding: 10px; border-radius: 5px; word-break: break-all;">${resetUrl}</p>
    
    <p>هذا الرابط سينتهي صلاحيته خلال ساعة واحدة.</p>
    
    <p>إذا لم تطلب هذا، يرجى تجاهل هذا البريد الإلكتروني.</p>
    
    <p style="margin-top: 20px;">مع أطيب التحيات،<br/>فريق مرحبا</p>
  </div>
</div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset Your Password / إعادة تعيين كلمة المرور - Marhaba",
        text: `Reset your password by clicking this link: ${resetUrl}`,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);
      return NextResponse.json(
        { message: "Failed to send reset email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "If your email is registered, you will receive a password reset link",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}