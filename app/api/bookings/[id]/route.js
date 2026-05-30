// app/api/bookings/[id]/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/postgres";
import { sendEmail } from "@/lib/sendEmail";

// ─────────────────────────────────────────────
// EMAIL TEMPLATES
// ─────────────────────────────────────────────
function getEmailContent(action, { userName, listingTitle, booking, hostName }) {
  const checkInDate  = new Date(booking.check_in).toDateString();
  const checkOutDate = new Date(booking.check_out).toDateString();
  const price        = booking.total_price;

  const templates = {

    // ── Booking confirmed ──────────────────────
    confirm: {
      subject: "Booking Confirmed / تأكيد الحجز 🎉",
      html: bilingual({
        enTitle: "🎉 Booking Confirmed",
        enColor: "#1D9E75",
        enBody: `
          <p>Hi ${userName},</p>
          <p>Your booking has been confirmed! We're excited to host you.</p>
          ${bookingBox({ listingTitle, checkInDate, checkOutDate, price })}
          <p>Enjoy your stay! ✨</p>`,
        arTitle: "🎉 تم تأكيد حجزك",
        arBody: `
          <p>مرحباً ${userName}،</p>
          <p>تم تأكيد حجزك بنجاح! نحن متحمسون لاستضافتك.</p>
          ${bookingBoxAr({ listingTitle, checkInDate, checkOutDate, price })}
          <p>نتمنى لك إقامة سعيدة! ✨</p>`,
      }),
    },

    // ── Booking cancelled ──────────────────────
    cancel: {
      subject: "Booking Cancelled / إلغاء الحجز ❌",
      html: bilingual({
        enTitle: "❌ Booking Cancelled",
        enColor: "#DC2626",
        enBody: `
          <p>Hi ${userName},</p>
          <p>Your booking has been cancelled. Contact support if you have questions.</p>
          ${bookingBox({ listingTitle, checkInDate, checkOutDate, bg: "#fef2f2" })}`,
        arTitle: "❌ تم إلغاء حجزك",
        arBody: `
          <p>مرحباً ${userName}،</p>
          <p>تم إلغاء حجزك. تواصل مع الدعم إذا كان لديك أسئلة.</p>
          ${bookingBoxAr({ listingTitle, checkInDate, checkOutDate, bg: "#fef2f2" })}`,
      }),
    },

    // ── Checked in ────────────────────────────
    check_in: {
      subject: "You've Checked In / تم تسجيل وصولك ✅",
      html: bilingual({
        enTitle: "✅ Check-In Confirmed",
        enColor: "#1D9E75",
        enBody: `
          <p>Hi ${userName},</p>
          <p>The host has confirmed your check-in. Enjoy your stay!</p>
          ${bookingBox({ listingTitle, checkInDate, checkOutDate, price })}`,
        arTitle: "✅ تم تسجيل وصولك",
        arBody: `
          <p>مرحباً ${userName}،</p>
          <p>قام المضيف بتأكيد وصولك. نتمنى لك إقامة ممتعة!</p>
          ${bookingBoxAr({ listingTitle, checkInDate, checkOutDate, price })}`,
      }),
    },

    // ── Checked out ───────────────────────────
    check_out: {
      subject: "You've Checked Out / تم تسجيل مغادرتك 👋",
      html: bilingual({
        enTitle: "👋 Check-Out Confirmed",
        enColor: "#4F46E5",
        enBody: `
          <p>Hi ${userName},</p>
          <p>Your check-out has been recorded. We hope you had a great time!</p>
          ${bookingBox({ listingTitle, checkInDate, checkOutDate, price })}
          <p>We'd love to have you again. 🌟</p>`,
        arTitle: "👋 تم تسجيل مغادرتك",
        arBody: `
          <p>مرحباً ${userName}،</p>
          <p>تم تسجيل مغادرتك. نأمل أنك قضيت وقتاً رائعاً!</p>
          ${bookingBoxAr({ listingTitle, checkInDate, checkOutDate, price })}
          <p>يسعدنا استقبالك مرة أخرى. 🌟</p>`,
      }),
    },

    // ── No-show ───────────────────────────────
    no_show: {
      subject: "No-Show Recorded / تسجيل غياب ⚠️",
      html: bilingual({
        enTitle: "⚠️ No-Show Recorded",
        enColor: "#D97706",
        enBody: `
          <p>Hi ${userName},</p>
          <p>The host marked you as a <strong>no-show</strong> for your booking of <strong>${listingTitle}</strong>.</p>
          <p>Check-in was scheduled for <strong>${checkInDate}</strong>.</p>
          <p>If this is a mistake, please contact support immediately.</p>`,
        arTitle: "⚠️ تم تسجيل غيابك",
        arBody: `
          <p>مرحباً ${userName}،</p>
          <p>قام المضيف بتسجيلك كـ <strong>غائب</strong> لحجز <strong>${listingTitle}</strong>.</p>
          <p>كان موعد تسجيل الوصول <strong>${checkInDate}</strong>.</p>
          <p>إذا كان هذا خطأ، يرجى التواصل مع الدعم فوراً.</p>`,
      }),
    },

    // ── User blocked ──────────────────────────
    blocked: {
      subject: "Account Restricted / تقييد الحساب 🚫",
      html: bilingual({
        enTitle: "🚫 You've Been Blocked",
        enColor: "#DC2626",
        enBody: `
          <p>Hi ${userName},</p>
          <p>The host <strong>${hostName}</strong> has blocked you from booking their listings.</p>
          <p>You will no longer be able to book any properties owned by this host.</p>
          <p>If you believe this is an error, please contact support.</p>`,
        arTitle: "🚫 تم حظرك",
        arBody: `
          <p>مرحباً ${userName}،</p>
          <p>قام المضيف <strong>${hostName}</strong> بحظرك من حجز عقاراته.</p>
          <p>لن تتمكن بعد الآن من حجز أي عقار يملكه هذا المضيف.</p>
          <p>إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع الدعم.</p>`,
      }),
    },
  };

  return templates[action] ?? null;
}

// ─────────────────────────────────────────────
// EMAIL HELPER PARTIALS
// ─────────────────────────────────────────────
function bilingual({ enTitle, enColor, enBody, arTitle, arBody }) {
  return `
<div style="font-family:Arial,'Cairo','Tajawal',sans-serif;max-width:600px;margin:auto;padding:20px;background:#fff;border-radius:12px;">
  <div style="margin-bottom:24px;">
    <h2 style="color:${enColor};margin-bottom:12px;">${enTitle}</h2>
    ${enBody}
    <p style="margin-top:20px;color:#6b7280;font-size:13px;">Best regards,<br/><strong>Marhaba Team</strong></p>
  </div>
  <div style="border-top:2px solid #e5e7eb;margin:20px 0;"></div>
  <div style="direction:rtl;text-align:right;">
    <h2 style="color:${enColor};margin-bottom:12px;">${arTitle}</h2>
    ${arBody}
    <p style="margin-top:20px;color:#6b7280;font-size:13px;">مع أطيب التحيات،<br/><strong>فريق مرحبا</strong></p>
  </div>
</div>`;
}

function bookingBox({ listingTitle, checkInDate, checkOutDate, price, bg = "#f9fafb" }) {
  return `
<div style="background:${bg};padding:15px;border-radius:10px;margin:15px 0;">
  <p><strong>🏠 Listing:</strong> ${listingTitle}</p>
  <p><strong>📅 Check-in:</strong> ${checkInDate}</p>
  <p><strong>📅 Check-out:</strong> ${checkOutDate}</p>
  ${price ? `<p><strong>💰 Total:</strong> ${price} LYD</p>` : ""}
</div>`;
}

function bookingBoxAr({ listingTitle, checkInDate, checkOutDate, price, bg = "#f9fafb" }) {
  return `
<div style="background:${bg};padding:15px;border-radius:10px;margin:15px 0;">
  <p><strong>🏠 العقار:</strong> ${listingTitle}</p>
  <p><strong>📅 تسجيل الوصول:</strong> ${checkInDate}</p>
  <p><strong>📅 تسجيل المغادرة:</strong> ${checkOutDate}</p>
  ${price ? `<p><strong>💰 الإجمالي:</strong> ${price} دينار</p>` : ""}
</div>`;
}

// ─────────────────────────────────────────────
// SEND EMAIL HELPER
// ─────────────────────────────────────────────
async function trySendEmail({ to, subject, html }) {
  try {
    const result = await sendEmail({ to, subject, text: subject, html });
    if (!result.success) console.error("Email failed:", result.error);
    else console.log("Email sent:", result.messageId);
  } catch (err) {
    console.error("Email error:", err.message);
  }
}

// ─────────────────────────────────────────────
// PUT — Update booking (confirm / cancel / check_in / check_out / no_show / block_user)
// ─────────────────────────────────────────────
export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id: bookingId } = await params;
    if (!bookingId) return NextResponse.json({ message: "Booking ID is required" }, { status: 400 });

    // Fetch booking with all related data
    const { rows } = await pool.query(
      `SELECT b.*,
              l.host_id, l.title AS listing_title,
              u.name AS user_name, u.email AS user_email,
              h.name AS host_name
       FROM bookings b
       JOIN listings l ON b.listing_id = l.id
       JOIN users u ON b.user_id = u.id
       JOIN users h ON l.host_id = h.id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (rows.length === 0)
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });

    const booking  = rows[0];
    const isHost   = booking.host_id  === decoded.userId;
    const isOwner  = booking.user_id  === decoded.userId;
    const { action } = await request.json();

    // ── CONFIRM ────────────────────────────────
    if (action === "confirm") {
      if (!isHost)
        return NextResponse.json({ message: "Only the host can confirm bookings" }, { status: 403 });
      if (booking.status === "confirmed")
        return NextResponse.json({ message: "Booking is already confirmed" }, { status: 400 });
      if (booking.status === "cancelled")
        return NextResponse.json({ message: "Cannot confirm a cancelled booking" }, { status: 400 });

      await pool.query(
        `UPDATE bookings SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [bookingId]
      );

      const email = getEmailContent("confirm", {
        userName: booking.user_name, listingTitle: booking.listing_title, booking,
      });
      await trySendEmail({ to: booking.user_email, ...email });

      return NextResponse.json({ message: "Booking confirmed successfully" });
    }

    // ── CANCEL ─────────────────────────────────
    if (action === "cancel") {
      if (!isOwner && !isHost)
        return NextResponse.json({ message: "Not authorized to cancel this booking" }, { status: 403 });
      if (booking.status === "cancelled")
        return NextResponse.json({ message: "Booking is already cancelled" }, { status: 400 });

      await pool.query(
        `UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [bookingId]
      );

      const email = getEmailContent("cancel", {
        userName: booking.user_name, listingTitle: booking.listing_title, booking,
      });
      await trySendEmail({ to: booking.user_email, ...email });

      return NextResponse.json({ message: "Booking cancelled successfully" });
    }

    // ── CHECK IN (host only) ───────────────────
    if (action === "check_in") {
      if (!isHost)
        return NextResponse.json({ message: "Only the host can mark check-in" }, { status: 403 });
      if (booking.status !== "confirmed")
        return NextResponse.json({ message: "Booking must be confirmed before check-in" }, { status: 400 });
      if (booking.checked_in_at)
        return NextResponse.json({ message: "Guest is already checked in" }, { status: 400 });

      await pool.query(
        `UPDATE bookings SET checked_in_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [bookingId]
      );

      const email = getEmailContent("check_in", {
        userName: booking.user_name, listingTitle: booking.listing_title, booking,
      });
      await trySendEmail({ to: booking.user_email, ...email });

      return NextResponse.json({ message: "Check-in recorded successfully" });
    }

    // ── CHECK OUT (host only) ──────────────────
    if (action === "check_out") {
      if (!isHost)
        return NextResponse.json({ message: "Only the host can mark check-out" }, { status: 403 });
      if (!booking.checked_in_at)
        return NextResponse.json({ message: "Guest must be checked in first" }, { status: 400 });
      if (booking.checked_out_at)
        return NextResponse.json({ message: "Guest is already checked out" }, { status: 400 });

      await pool.query(
        `UPDATE bookings SET checked_out_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [bookingId]
      );

      const email = getEmailContent("check_out", {
        userName: booking.user_name, listingTitle: booking.listing_title, booking,
      });
      await trySendEmail({ to: booking.user_email, ...email });

      return NextResponse.json({ message: "Check-out recorded successfully" });
    }

    // ── NO SHOW (host only) ────────────────────
    if (action === "no_show") {
      if (!isHost)
        return NextResponse.json({ message: "Only the host can mark no-show" }, { status: 403 });
      if (booking.status !== "confirmed")
        return NextResponse.json({ message: "Booking must be confirmed to mark no-show" }, { status: 400 });
      if (booking.no_show)
        return NextResponse.json({ message: "Already marked as no-show" }, { status: 400 });

      await pool.query(
        `UPDATE bookings 
         SET no_show = true, status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [bookingId]
      );

      const email = getEmailContent("no_show", {
        userName: booking.user_name, listingTitle: booking.listing_title, booking,
      });
      await trySendEmail({ to: booking.user_email, ...email });

      return NextResponse.json({ message: "No-show recorded successfully" });
    }

    // ── BLOCK USER (host only) ─────────────────
    if (action === "block_user") {
      if (!isHost)
        return NextResponse.json({ message: "Only the host can block users" }, { status: 403 });

      const { reason = "manual" } = await request.json().catch(() => ({}));
      const validReasons = ["no_show", "cancellation", "manual"];
      const blockReason  = validReasons.includes(reason) ? reason : "manual";

      // Check if already blocked
      const existing = await pool.query(
        `SELECT id FROM host_blocked_users WHERE host_id = $1 AND user_id = $2`,
        [booking.host_id, booking.user_id]
      );

      if (existing.rows.length > 0)
        return NextResponse.json({ message: "User is already blocked" }, { status: 400 });

      await pool.query(
        `INSERT INTO host_blocked_users (host_id, user_id, booking_id, reason)
         VALUES ($1, $2, $3, $4)`,
        [booking.host_id, booking.user_id, bookingId, blockReason]
      );

      const email = getEmailContent("blocked", {
        userName: booking.user_name,
        listingTitle: booking.listing_title,
        booking,
        hostName: booking.host_name,
      });
      await trySendEmail({ to: booking.user_email, ...email });

      return NextResponse.json({ message: "User blocked successfully" });
    }

    return NextResponse.json(
      { message: "Invalid action. Valid actions: confirm, cancel, check_in, check_out, no_show, block_user" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// GET — Single booking
// ─────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded    = jwt.verify(token, process.env.JWT_SECRET);
    const { id: bookingId } = await params;
    if (!bookingId) return NextResponse.json({ message: "Booking ID is required" }, { status: 400 });

    const { rows } = await pool.query(
      `SELECT b.*,
              l.title AS listing_title, l.location AS listing_location,
              l.price AS listing_price, l.images AS listing_images,
              u.name AS user_name, u.email AS user_email, u.phone_number AS user_phone
       FROM bookings b
       JOIN listings l ON b.listing_id = l.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (rows.length === 0)
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });

    const booking = rows[0];
    const isOwner = booking.user_id === decoded.userId;
    const isHost  = await checkIfUserIsHost(decoded.userId, booking.listing_id);

    if (!isOwner && !isHost)
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

    return NextResponse.json({
      booking: {
        id:              booking.id,
        listing_id:      booking.listing_id,
        user_id:         booking.user_id,
        check_in:        booking.check_in,
        check_out:       booking.check_out,
        checked_in_at:   booking.checked_in_at,   // ← new
        checked_out_at:  booking.checked_out_at,  // ← new
        no_show:         booking.no_show,          // ← new
        total_price:     booking.total_price,
        guests:          booking.guests,
        status:          booking.status,
        created_at:      booking.created_at,
        updated_at:      booking.updated_at,
        listing: {
          title:    booking.listing_title,
          location: booking.listing_location,
          price:    booking.listing_price,
          images:   booking.listing_images,
        },
        user: {
          name:        booking.user_name,
          email:       booking.user_email,
          phoneNumber: booking.user_phone,
        },
      },
    });
  } catch (error) {
    console.error("Fetch booking error:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// DELETE — Delete booking
// ─────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id: bookingId } = await params;
    if (!bookingId) return NextResponse.json({ message: "Booking ID is required" }, { status: 400 });

    const { rows } = await pool.query(
      `SELECT b.*, l.host_id FROM bookings b JOIN listings l ON b.listing_id = l.id WHERE b.id = $1`,
      [bookingId]
    );

    if (rows.length === 0)
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });

    const booking = rows[0];
    if (booking.host_id !== decoded.userId && booking.user_id !== decoded.userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

    await pool.query(`DELETE FROM bookings WHERE id = $1`, [bookingId]);
    return NextResponse.json({ message: "Booking deleted successfully" });

  } catch (error) {
    console.error("Delete booking error:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
async function checkIfUserIsHost(userId, listingId) {
  const { rows } = await pool.query(
    `SELECT host_id FROM listings WHERE id = $1 AND host_id = $2`,
    [listingId, userId]
  );
  return rows.length > 0;
}