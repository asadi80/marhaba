// lib/email.js 
import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, text, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email configuration missing");
    return {
      success: false,
      error: "Email configuration missing",
    };
  }

  try {
    console.log(`Sending email to: ${to}`);
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "65.109.38.16",
      port: parseInt(process.env.EMAIL_PORT) || 465,
      secure: process.env.EMAIL_SECURE === 'true' || true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
        servername: 'mail.mar-haba.ly', // Important for SSL
      },
      // Timeouts
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verify connection
    await transporter.verify();
    console.log("SMTP connection verified");

    const info = await transporter.sendMail({
      from: `"Marhaba" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || html?.replace(/<[^>]*>/g, "") || "",
      html: html || text?.replace(/\n/g, "<br>") || "",
    });

    console.log("Email sent:", info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email error:", error);
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
}