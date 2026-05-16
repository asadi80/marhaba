// app/api/bookings/[id]/route.js - POSTGRESQL VERSION
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/postgres";
import { sendEmail } from "@/lib/sendEmail";

// Bilingual email template with both languages together
function getBilingualEmailContent(userName, listingTitle, booking, action) {
  const checkInDate = new Date(booking.check_in).toDateString();
  const checkOutDate = new Date(booking.check_out).toDateString();
  const totalPrice = booking.total_price;
  
  if (action === 'confirm') {
    return {
      subject: "Booking Confirmed / تأكيد الحجز 🎉",
      text: `English: Your booking for ${listingTitle} has been confirmed. Check-in: ${checkInDate}, Check-out: ${checkOutDate}, Total: ${totalPrice} LYD\n\nالعربية: تم تأكيد حجزك لـ ${listingTitle}. تسجيل الوصول: ${checkInDate}، تسجيل المغادرة: ${checkOutDate}، السعر الإجمالي: ${totalPrice} دينار`,
      html: `
<div style="font-family: Arial, 'Cairo', 'Tajawal', sans-serif; max-width: 600px; margin: auto; padding: 20px;">
  
  <!-- English Section -->
  <div style="margin-bottom: 30px;">
    <h2 style="color: #4F46E5;">🎉 Booking Confirmed</h2>
    
    <p>Hi ${userName},</p>
    
    <p>Your booking has been confirmed! We're excited to host you.</p>
    
    <div style="background: #f9fafb; padding: 15px; border-radius: 10px; margin-top: 15px;">
      <p><strong>🏠 Listing:</strong> ${listingTitle}</p>
      <p><strong>📅 Check-in:</strong> ${checkInDate}</p>
      <p><strong>📅 Check-out:</strong> ${checkOutDate}</p>
      <p><strong>💰 Total Price:</strong> ${totalPrice} LYD</p>
    </div>

    <p style="margin-top: 20px;">Enjoy your stay! ✨</p>
    <p>Best regards,<br/>Marhaba Team</p>
  </div>
  
  <div style="border-top: 2px solid #e5e7eb; margin: 20px 0;"></div>
  
  <!-- Arabic Section -->
  <div style="direction: rtl; text-align: right;">
    <h2 style="color: #4F46E5;">🎉 تم تأكيد حجزك</h2>
    
    <p>مرحباً ${userName}،</p>
    
    <p>تم تأكيد حجزك بنجاح! نحن متحمسون لاستضافتك.</p>
    
    <div style="background: #f9fafb; padding: 15px; border-radius: 10px; margin-top: 15px;">
      <p><strong>🏠 العقار:</strong> ${listingTitle}</p>
      <p><strong>📅 تسجيل الوصول:</strong> ${checkInDate}</p>
      <p><strong>📅 تسجيل المغادرة:</strong> ${checkOutDate}</p>
      <p><strong>💰 السعر الإجمالي:</strong> ${totalPrice} دينار</p>
    </div>

    <p style="margin-top: 20px;">نتمنى لك إقامة سعيدة! ✨</p>
    <p>مع أطيب التحيات،<br/>فريق مرحبا</p>
  </div>
</div>
      `
    };
  }
  
  if (action === 'cancel') {
    return {
      subject: "Booking Cancelled / إلغاء الحجز ❌",
      text: `English: Your booking for ${listingTitle} has been cancelled. Check-in: ${checkInDate}, Check-out: ${checkOutDate}\n\nالعربية: تم إلغاء حجزك لـ ${listingTitle}. تسجيل الوصول: ${checkInDate}، تسجيل المغادرة: ${checkOutDate}`,
      html: `
<div style="font-family: Arial, 'Cairo', 'Tajawal', sans-serif; max-width: 600px; margin: auto; padding: 20px;">
  
  <!-- English Section -->
  <div style="margin-bottom: 30px;">
    <h2 style="color: #DC2626;">❌ Booking Cancelled</h2>
    
    <p>Hi ${userName},</p>
    
    <p>Your booking has been cancelled. If you have any questions, please contact support.</p>
    
    <div style="background: #fef2f2; padding: 15px; border-radius: 10px; margin-top: 15px;">
      <p><strong>🏠 Listing:</strong> ${listingTitle}</p>
      <p><strong>📅 Check-in:</strong> ${checkInDate}</p>
      <p><strong>📅 Check-out:</strong> ${checkOutDate}</p>
    </div>

    <p style="margin-top: 20px;">We apologize for any inconvenience.</p>
    <p>Best regards,<br/>Marhaba Team</p>
  </div>
  
  <div style="border-top: 2px solid #e5e7eb; margin: 20px 0;"></div>
  
  <!-- Arabic Section -->
  <div style="direction: rtl; text-align: right;">
    <h2 style="color: #DC2626;">❌ تم إلغاء حجزك</h2>
    
    <p>مرحباً ${userName}،</p>
    
    <p>تم إلغاء حجزك. إذا كان لديك أي أسئلة، يرجى التواصل مع الدعم.</p>
    
    <div style="background: #fef2f2; padding: 15px; border-radius: 10px; margin-top: 15px;">
      <p><strong>🏠 العقار:</strong> ${listingTitle}</p>
      <p><strong>📅 تسجيل الوصول:</strong> ${checkInDate}</p>
      <p><strong>📅 تسجيل المغادرة:</strong> ${checkOutDate}</p>
    </div>

    <p style="margin-top: 20px;">نأسف لأي إزعاج.</p>
    <p>مع أطيب التحيات،<br/>فريق مرحبا</p>
  </div>
</div>
      `
    };
  }
  
  return null;
}

// PUT - Update booking status (confirm or cancel)
export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded userId:", decoded.userId);

    const { id: bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 },
      );
    }

    // Get booking with listing info
    const bookingResult = await pool.query(
      `SELECT b.*, l.host_id, l.title as listing_title, 
              u.name as user_name, u.email as user_email, u.phone_number as user_phone
       FROM bookings b
       JOIN listings l ON b.listing_id = l.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    const booking = bookingResult.rows[0];
    const { action } = await request.json();

    // Handle confirm action (host only)
    if (action === "confirm") {
      // Check if user is the host of the listing
      if (booking.host_id !== decoded.userId) {
        return NextResponse.json(
          { message: "Only the host can confirm bookings" },
          { status: 403 },
        );
      }

      // Check if booking is already confirmed
      if (booking.status === "confirmed") {
        return NextResponse.json(
          { message: "Booking is already confirmed" },
          { status: 400 },
        );
      }

      // Check if booking is cancelled
      if (booking.status === "cancelled") {
        return NextResponse.json(
          { message: "Cannot confirm a cancelled booking" },
          { status: 400 },
        );
      }

      // Update booking status
      await pool.query(
        `UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        ["confirmed", bookingId]
      );

      // Get updated booking
      const updatedBooking = { ...booking, status: "confirmed" };

      // Send confirmation email
      const emailContent = getBilingualEmailContent(
        booking.user_name,
        booking.listing_title,
        updatedBooking,
        'confirm'
      );

      try {
        const emailResult = await sendEmail({
          to: booking.user_email,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        });

        console.log("Email send result:", emailResult);

        if (!emailResult.success) {
          console.error("Email failed to send:", emailResult.error);
        } else {
          console.log("Email sent successfully with ID:", emailResult.messageId);
        }
      } catch (err) {
        console.error("Email sending error:", err);
      }

      return NextResponse.json({
        message: "Booking confirmed successfully",
        booking: updatedBooking,
      });
    }

    // Handle cancel action (both host and user can cancel)
    if (action === "cancel") {
      // Check if user is the booking owner or host
      const isOwner = booking.user_id === decoded.userId;
      const isHost = booking.host_id === decoded.userId;

      if (!isOwner && !isHost) {
        console.log("Authorization failed - not owner and not host");
        return NextResponse.json(
          { message: "You are not authorized to cancel this booking" },
          { status: 403 },
        );
      }

      // Check if booking is already cancelled
      if (booking.status === "cancelled") {
        return NextResponse.json(
          { message: "Booking is already cancelled" },
          { status: 400 },
        );
      }

      // Update booking status
      await pool.query(
        `UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        ["cancelled", bookingId]
      );

      const updatedBooking = { ...booking, status: "cancelled" };

      // Send cancellation email
      const emailContent = getBilingualEmailContent(
        booking.user_name,
        booking.listing_title,
        updatedBooking,
        'cancel'
      );

      try {
        const emailResult = await sendEmail({
          to: booking.user_email,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        });
        
        console.log("Email send result:", emailResult);
        
        if (!emailResult.success) {
          console.error("Email failed to send:", emailResult.error);
        } else {
          console.log("Email sent successfully with ID:", emailResult.messageId);
        }
      } catch (err) {
        console.error("Email failed:", err.message);
      }

      return NextResponse.json({
        message: "Booking cancelled successfully",
        booking: updatedBooking,
      });
    }

    return NextResponse.json(
      { message: 'Invalid action. Use "confirm" or "cancel"' },
      { status: 400 },
    );
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}

// GET - Get single booking
export async function GET(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id: bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 },
      );
    }

    // Get booking with listing and user info
    const bookingResult = await pool.query(
      `SELECT b.*, 
              l.title as listing_title, l.location as listing_location, l.price as listing_price, l.images as listing_images,
              u.name as user_name, u.email as user_email, u.phone_number as user_phone
       FROM bookings b
       JOIN listings l ON b.listing_id = l.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    const booking = bookingResult.rows[0];

    // Check if user is authorized to view this booking
    const isOwner = booking.user_id === decoded.userId;
    const isHost = await checkIfUserIsHost(decoded.userId, booking.listing_id);

    if (!isOwner && !isHost) {
      return NextResponse.json(
        { message: "Unauthorized to view this booking" },
        { status: 403 },
      );
    }

    // Format response
    const formattedBooking = {
      id: booking.id,
      listing_id: booking.listing_id,
      user_id: booking.user_id,
      check_in: booking.check_in,
      check_out: booking.check_out,
      total_price: booking.total_price,
      guests: booking.guests,
      status: booking.status,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      listing: {
        title: booking.listing_title,
        location: booking.listing_location,
        price: booking.listing_price,
        images: booking.listing_images,
      },
      user: {
        name: booking.user_name,
        email: booking.user_email,
        phoneNumber: booking.user_phone,
      },
    };

    return NextResponse.json({ booking: formattedBooking });
  } catch (error) {
    console.error("Fetch booking error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}

// Helper function to check if user is host of a listing
async function checkIfUserIsHost(userId, listingId) {
  const result = await pool.query(
    `SELECT host_id FROM listings WHERE id = $1 AND host_id = $2`,
    [listingId, userId]
  );
  return result.rows.length > 0;
}

// DELETE - Delete booking (admin or host only)
export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id: bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 },
      );
    }

    // Get booking with listing info
    const bookingResult = await pool.query(
      `SELECT b.*, l.host_id FROM bookings b JOIN listings l ON b.listing_id = l.id WHERE b.id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    const booking = bookingResult.rows[0];
    const isHost = booking.host_id === decoded.userId;
    const isOwner = booking.user_id === decoded.userId;

    if (!isHost && !isOwner) {
      return NextResponse.json(
        { message: "Unauthorized to delete this booking" },
        { status: 403 },
      );
    }

    await pool.query(`DELETE FROM bookings WHERE id = $1`, [bookingId]);

    return NextResponse.json({
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}