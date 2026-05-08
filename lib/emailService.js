// lib/emailService.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendHostExpiryWarning = async (user, daysLeft, expiryDate) => {
  const subject = daysLeft === 0 
    ? "⚠️ Your Host Subscription Has Expired" 
    : `⚠️ Your Host Subscription Expires in ${daysLeft} Day${daysLeft > 1 ? 's' : ''}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #1a1a2e; margin: 0;">mar<span style="color: #e8c547;">haba</span></h2>
      </div>
      
      <div style="background: #f7f6f2; padding: 30px; border-radius: 12px;">
        <h3 style="color: #1a1a2e; margin-top: 0;">Dear ${user.name},</h3>
        
        ${daysLeft === 0 ? `
          <p style="color: #e05a5a; font-size: 16px;"><strong>Your 6-month hosting subscription has expired.</strong></p>
          <p>Your listings have been deactivated and you cannot accept new bookings until you renew your subscription.</p>
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>What happens now?</strong></p>
            <ul style="margin: 10px 0 0 20px;">
              <li>Your listings are hidden from search results</li>
              <li>Existing bookings will still be honored</li>
              <li>You won't receive new booking requests</li>
            </ul>
          </div>
        ` : `
          <p>Your 6-month hosting subscription will expire in <strong style="color: #e8c547; font-size: 18px;">${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>.</p>
          <p><strong>Expiry Date:</strong> ${new Date(expiryDate).toLocaleDateString()}</p>
          <p>After expiration, your listings will be deactivated and you won't be able to accept new bookings.</p>
        `}
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/host/renew" 
             style="background-color: #e8c547; color: #1a1a2e; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            ${daysLeft === 0 ? 'Reactivate Subscription →' : 'Renew Subscription →'}
          </a>
        </div>
        
        <hr style="margin: 20px 0; border-color: #e0e0e0;" />
        <p style="font-size: 12px; color: #666; margin-bottom: 0;">
          Need help? Contact our support team at <a href="mailto:support@marhaba.com" style="color: #e8c547;">support@marhaba.com</a>
        </p>
      </div>
    </div>
  `;
  
  try {
    await transporter.sendMail({
      from: `"Marhaba" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject,
      html,
    });
    console.log(`Email sent to ${user.email} (${daysLeft} days left)`);
  } catch (error) {
    console.error(`Failed to send email to ${user.email}:`, error);
  }
};

export const sendUserSuspensionWarning = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #1a1a2e; margin: 0;">mar<span style="color: #e8c547;">haba</span></h2>
      </div>
      
      <div style="background: #f7f6f2; padding: 30px; border-radius: 12px;">
        <h3 style="color: #1a1a2e; margin-top: 0;">Dear ${user.name},</h3>
        
        <p>Your account has been suspended due to <strong>1 year of inactivity</strong>.</p>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>To reactivate your account:</strong></p>
          <ol style="margin: 10px 0 0 20px;">
            <li>Log in to your account</li>
            <li>Complete identity verification</li>
            <li>Contact support to request reactivation</li>
          </ol>
        </div>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
             style="background-color: #e8c547; color: #1a1a2e; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Log In to Reactivate →
          </a>
        </div>
        
        <hr style="margin: 20px 0; border-color: #e0e0e0;" />
        <p style="font-size: 12px; color: #666; margin-bottom: 0;">
          Questions? Contact us at <a href="mailto:support@marhaba.com" style="color: #e8c547;">support@marhaba.com</a>
        </p>
      </div>
    </div>
  `;
  
  try {
    await transporter.sendMail({
      from: `"Marhaba" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: "⚠️ Your Account Has Been Suspended Due to Inactivity",
      html,
    });
  } catch (error) {
    console.error(`Failed to send suspension email to ${user.email}:`, error);
  }
};