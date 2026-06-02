// app/api/contact/route.js
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(request) {
  console.log("route was used");

  try {
    const { name, email, role, subject, message } = await request.json();
    console.log(name, email, role, subject, message);

    // ── Validation ──
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "Name, email, subject, and message are required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 },
      );
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { message: "Message must be at least 10 characters" },
        { status: 400 },
      );
    }

    // ── Shared style tokens ──
    const navy = "#1a1a2e";
    const navy2 = "#2d2d5e";
    const gold = "#e8c547";
    const goldBg = "rgba(232,197,71,0.12)";
    const goldBorder = "rgba(232,197,71,0.3)";
    const surface = "#f8f9fa";
    const border = "#e9ecef";
    const textPrimary = "#111827";
    const textSecondary = "#6b7280";
    const textMuted = "#9ca3af";

    const sharedStyles = `
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
      body { margin:0; padding:0; background:#f4f4f5; font-family:'Cairo',Arial,sans-serif; -webkit-font-smoothing:antialiased; }
      a { text-decoration:none; }
    `;

    // ── Logo block (reusable) ──
    const logoHtml = `
      <span style="font-family:'Cairo','Tajawal',Arial,sans-serif;font-size:30px;font-weight:500;color:#ffffff;letter-spacing:1px;">
        مر<span style="font-weight:700;color:${gold};">حبا</span>
      </span>
    `;

    // ── Row helper ──
    const infoRow = (label, labelAr, value, last = false) => `
      <tr>
        <td style="padding:14px 24px;${last ? "" : `border-bottom:1px solid ${border};`}background:${surface};">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${textMuted};">${label} · ${labelAr}</span><br/>
          <span style="font-size:14px;font-weight:600;color:${textPrimary};margin-top:4px;display:inline-block;">${value}</span>
        </td>
      </tr>
    `;

    // ── 1. Email to support team ──
    const supportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Message</title>
  <style>${sharedStyles}</style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${navy} 0%,${navy2} 100%);padding:36px 40px;position:relative;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>${logoHtml}</td>
                  <td align="right">
                    <span style="display:inline-block;background:${goldBg};border:1px solid ${goldBorder};color:${gold};padding:6px 14px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">
                      New Message · رسالة جديدة
                    </span>
                  </td>
                </tr>
              </table>
              <div style="margin-top:24px;">
                <div style="width:36px;height:3px;background:${gold};border-radius:2px;margin-bottom:12px;"></div>
                <p style="margin:0;font-size:22px;font-weight:300;color:#ffffff;line-height:1.3;">
                  New contact from <strong style="font-weight:700;color:${gold};">${name}</strong>
                </p>
                <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.45);">رسالة تواصل جديدة من ${name}</p>
              </div>
            </td>
          </tr>

          <!-- Sender details -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${textMuted};">Sender details · تفاصيل المرسل</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:14px;overflow:hidden;border:1px solid ${border};">
                ${infoRow("Name", "الاسم", name)}
                ${infoRow("Email", "البريد الإلكتروني", `<a href="mailto:${email}" style="color:${navy};font-weight:600;">${email}</a>`)}
                ${infoRow("Role", "الصفة", role || "Not specified · غير محدد")}
                ${infoRow("Subject", "الموضوع", subject, true)}
              </table>
            </td>
          </tr>

          <!-- Message body -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${textMuted};">Message · الرسالة</p>
              <div style="background:${surface};border-radius:14px;border:1px solid ${border};padding:24px;border-left:4px solid ${gold};border-radius:0 14px 14px 0;">
                <p style="margin:0;font-size:14px;color:${textSecondary};line-height:1.85;white-space:pre-wrap;">${message}</p>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:32px 40px 40px;text-align:center;">
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}"
                style="display:inline-block;background:${navy};color:${gold};padding:15px 36px;border-radius:14px;font-size:14px;font-weight:700;letter-spacing:0.03em;">
                Reply to ${name} · الرد →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${surface};padding:18px 40px;text-align:center;border-top:1px solid ${border};">
              <p style="margin:0;font-size:11px;color:${textMuted};">
                © ${new Date().getFullYear()} Marhaba · مرحباً &nbsp;·&nbsp; Libya
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const supportResult = await sendEmail({
      to: process.env.SUPPORT_EMAIL || "support@mar-haba.ly",
      subject: `[Contact] ${subject} — from ${name}`,
      html: supportHtml,
    });

    if (!supportResult.success) {
      console.error("Failed to send support email:", supportResult.error);
      return NextResponse.json(
        { message: "Failed to send message. Please try again later." },
        { status: 500 },
      );
    }

    // ── 2. Auto-reply to the user ──
    const preview = message.length > 160 ? message.slice(0, 160) + "…" : message;

    const userHtml = `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>We received your message — Marhaba</title>
  <style>${sharedStyles}</style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${navy} 0%,${navy2} 100%);padding:44px 40px;text-align:center;">
              <div style="margin-bottom:20px;">${logoHtml}</div>
              <div style="width:60px;height:60px;background:${goldBg};border:1px solid ${goldBorder};border-radius:50%;margin:0 auto 20px;line-height:60px;text-align:center;font-size:26px;">✅</div>
              <h1 style="margin:0 0 6px;font-size:22px;font-weight:600;color:#ffffff;">We got your message!</h1>
              <p style="margin:0;font-size:15px;font-weight:300;color:rgba(255,255,255,0.55);">لقد استلمنا رسالتك بنجاح</p>
            </td>
          </tr>

          <!-- Body EN -->
          <tr>
            <td style="padding:36px 40px 0;">
              <p style="margin:0 0 12px;font-size:15px;color:${textPrimary};line-height:1.7;">
                Hi <strong>${name}</strong>,
              </p>
              <p style="margin:0 0 20px;font-size:14px;color:${textSecondary};line-height:1.85;">
                Thanks for reaching out to Marhaba. We've received your message and our team will get back to you within
                <strong style="color:${navy};">24 hours</strong>.
              </p>

              <!-- Message summary -->
              <div style="background:${surface};border-radius:0 14px 14px 0;border:1px solid ${border};border-left:4px solid ${gold};padding:20px 24px;margin-bottom:8px;">
                <p style="margin:0 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${textMuted};">Your message summary</p>
                <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${textPrimary};">${subject}</p>
                <p style="margin:0;font-size:13px;color:${textSecondary};line-height:1.75;">${preview}</p>
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:28px 40px;">
              <div style="height:1px;background:linear-gradient(to right, transparent, ${border} 20%, ${border} 80%, transparent);"></div>
            </td>
          </tr>

          <!-- Body AR -->
          <tr>
            <td style="padding:0 40px 0;" dir="rtl">
              <p style="margin:0 0 12px;font-size:15px;color:${textPrimary};line-height:1.8;font-family:'Cairo','Tajawal',Arial,sans-serif;">
                مرحباً <strong>${name}</strong>،
              </p>
              <p style="margin:0 0 20px;font-size:14px;color:${textSecondary};line-height:2;font-family:'Cairo','Tajawal',Arial,sans-serif;">
                شكراً لتواصلك مع مرحباً. لقد استلمنا رسالتك بنجاح، وسيرد فريقنا عليك خلال
                <strong style="color:${navy};">٢٤ ساعة</strong>.
              </p>

              <!-- Message summary AR -->
              <div style="background:${surface};border-radius:14px 0 0 14px;border:1px solid ${border};border-right:4px solid ${gold};padding:20px 24px;margin-bottom:8px;font-family:'Cairo','Tajawal',Arial,sans-serif;">
                <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.05em;color:${textMuted};">ملخص رسالتك</p>
                <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${textPrimary};">${subject}</p>
                <p style="margin:0;font-size:13px;color:${textSecondary};line-height:1.85;">${preview}</p>
              </div>

              <p style="margin:20px 0 0;font-size:13px;color:${textMuted};line-height:2;font-family:'Cairo','Tajawal',Arial,sans-serif;">
                للتواصل المباشر:
                <a href="mailto:support@mar-haba.ly" style="color:${navy};font-weight:700;">support@mar-haba.ly</a>
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:36px 40px;text-align:center;">
              <a href="${process.env.NEXTAUTH_URL || "https://mar-haba.ly"}"
                style="display:inline-block;background:${navy};color:${gold};padding:15px 36px;border-radius:14px;font-size:14px;font-weight:700;letter-spacing:0.03em;">
                Back to Marhaba · العودة إلى مرحباً →
              </a>
            </td>
          </tr>

          <!-- Trust badges -->
          <tr>
            <td style="padding:0 40px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:0 8px;">
                    <div style="background:${surface};border:1px solid ${border};border-radius:12px;padding:14px 10px;text-align:center;">
                      <div style="font-size:20px;margin-bottom:6px;">🔒</div>
                      <p style="margin:0;font-size:11px;font-weight:700;color:${textPrimary};">Secure</p>
                      <p style="margin:2px 0 0;font-size:10px;color:${textMuted};">آمن</p>
                    </div>
                  </td>
                  <td align="center" style="padding:0 8px;">
                    <div style="background:${surface};border:1px solid ${border};border-radius:12px;padding:14px 10px;text-align:center;">
                      <div style="font-size:20px;margin-bottom:6px;">⚡</div>
                      <p style="margin:0;font-size:11px;font-weight:700;color:${textPrimary};">Fast Reply</p>
                      <p style="margin:2px 0 0;font-size:10px;color:${textMuted};">رد سريع</p>
                    </div>
                  </td>
                  <td align="center" style="padding:0 8px;">
                    <div style="background:${surface};border:1px solid ${border};border-radius:12px;padding:14px 10px;text-align:center;">
                      <div style="font-size:20px;margin-bottom:6px;">🇱🇾</div>
                      <p style="margin:0;font-size:11px;font-weight:700;color:${textPrimary};">Libya-based</p>
                      <p style="margin:2px 0 0;font-size:10px;color:${textMuted};">من ليبيا</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${surface};padding:18px 40px;text-align:center;border-top:1px solid ${border};">
              <p style="margin:0 0 4px;font-size:11px;color:${textMuted};">
                You're receiving this because you contacted us at mar-haba.ly
              </p>
              <p style="margin:0;font-size:11px;color:${textMuted};">
                © ${new Date().getFullYear()} Marhaba · مرحباً &nbsp;·&nbsp; Libya
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    sendEmail({
      to: email,
      subject: `We received your message — Marhaba · مرحباً`,
      html: userHtml,
    }).catch((err) => console.error("Auto-reply failed:", err));

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact route error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}