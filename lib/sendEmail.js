// lib/sendEmail.js - Fixed version
import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, text, html }) {
  // Check if email is configured - USE THE CORRECT VARIABLE NAME
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {  // Changed from EMAIL_PASSWORD to EMAIL_PASS
    console.log('Email not configured. Skipping email send.');
    console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
    console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
    return { success: false, error: 'Email configuration missing' };
  }

  try {
    console.log(`Attempting to send email to: ${to}`);
    console.log(`Using email user: ${process.env.EMAIL_USER}`);
    
    // Configure transporter for Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Simpler configuration for Gmail
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use the correct variable
      },
    });

    // Verify connection before sending
    await transporter.verify();
    console.log('Email transporter verified successfully');

    // Send mail
    const info = await transporter.sendMail({
      from: `"Marhaba" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || html?.replace(/<[^>]*>/g, '') || '',
      html: html || text?.replace(/\n/g, '<br>') || '',
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Detailed email error:', error);
    return { success: false, error: error.message };
  }
}