// scripts/test-email-direct.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testEmail() {
  console.log('📧 Testing with direct IP...');
  
  // Use the direct IP address of your server
  const config = {
    host: '65.109.38.16',  // Direct IP - bypasses DNS
    port: 465,
    secure: true,
    auth: {
      user: 'noreply@mar-haba.ly',
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      servername: 'mail.mar-haba.ly', // SNI for certificate
    },
    debug: true,
  };
  
  try {
    console.log('\n🔌 Connecting to 65.109.38.16:465...');
    const transporter = nodemailer.createTransport(config);
    
    await transporter.verify();
    console.log('✅ Connection successful!');
    
    const info = await transporter.sendMail({
      from: '"Marhaba" <noreply@mar-haba.ly>',
      to: 'a-sadi@outlook.com',
      subject: 'Test - Direct IP Connection',
      text: 'Email is working! The DNS issue is identified.',
      html: '<h1>Success!</h1><p>Email is working! The DNS issue is identified.</p>',
    });
    
    console.log('✅ Email sent!');
    console.log('📧 Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) console.error('Code:', error.code);
  }
}

testEmail();