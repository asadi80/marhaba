// lib/sendEmail.js - Updated version
import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, text, html }) {
  // Check if email is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('Email not configured. Skipping email send.');
    return;
  }

  // Configure transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Send mail
  await transporter.sendMail({
    from: `"Marhaba" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject,
    text: text || html?.replace(/<[^>]*>/g, '') || '', // Convert html to text if needed
    html: html || text?.replace(/\n/g, '<br>') || '', // Convert text to html if needed
  });
}