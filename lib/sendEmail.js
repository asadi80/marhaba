import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, text, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email configuration missing - EMAIL_USER or EMAIL_PASS not set");
    return {
      success: false,
      error: "Email configuration missing",
    };
  }

  try {
    console.log(`Attempting to send email to: ${to}`);
    console.log(`Using email user: ${process.env.EMAIL_USER}`);

    // Try multiple port configurations
    const transporterConfigs = [
      {
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
      },
      {
        host: "mx1.secure.ly",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      {
        host: "mail.secure.ly",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
    ];

    let lastError = null;

    // Try each configuration
    for (const config of transporterConfigs) {
      try {
        const transporter = nodemailer.createTransport(config);
        
        // Verify connection
        await transporter.verify();
        console.log(`SMTP VERIFIED with config: ${config.host}:${config.port}`);

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
        console.log(`Failed with config ${config.host}:${config.port} - ${error.message}`);
        lastError = error;
        // Continue to next config
      }
    }

    // If all configs fail
    throw lastError || new Error("All connection attempts failed");

  } catch (error) {
    console.error("EMAIL ERROR:", error);
    
    // Log more details for debugging
    if (error.code) console.error("Error code:", error.code);
    if (error.command) console.error("Command:", error.command);
    
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
}