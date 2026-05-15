import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, text, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("Email configuration missing");

    return {
      success: false,
      error: "Email configuration missing",
    };
  }

  try {
    console.log(`Attempting to send email to: ${to}`);

    const transporter = nodemailer.createTransport({
      host: "mx1.secure.ly",
      port: 465,
      secure: true,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.verify();

    console.log("SMTP VERIFIED");

    const info = await transporter.sendMail({
      from: `"Marhaba" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || html?.replace(/<[^>]*>/g, "") || "",
      html: html || text?.replace(/\n/g, "<br>") || "",
    });

    console.log("EMAIL SENT:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("EMAIL ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}