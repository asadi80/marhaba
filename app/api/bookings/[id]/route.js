// app/api/bookings/[id]/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Listing from "@/models/Listing";
import User from "@/models/User";
import { sendEmail } from "@/lib/sendEmail";
import mongoose from "mongoose";

// Bilingual email template with both languages together
function getBilingualEmailContent(userName, listingTitle, booking, action) {
  const checkInDate = new Date(booking.checkIn).toDateString();
  const checkOutDate = new Date(booking.checkOut).toDateString();
  const totalPrice = booking.totalPrice;
  
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

    // Unwrap params Promise
    const unwrappedParams = await params;
    const bookingId = unwrappedParams.id;

    if (!bookingId) {
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    await booking.populate("listing", "title");
    await booking.populate("user", "name email phoneNumber");

    const { action } = await request.json();

    // Handle confirm action (host only)
    if (action === "confirm") {
      // Check if user is the host of the listing
      const listingDoc = await Listing.findById(booking.listing);
      if (!listingDoc || listingDoc.host.toString() !== decoded.userId) {
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

      booking.status = "confirmed";
      await booking.save();

      const user = booking.user;
      const listingData = booking.listing;

      // Get bilingual email content
      const emailContent = getBilingualEmailContent(
        user.name, 
        listingData.title, 
        booking, 
        'confirm'
      );

      try {
        const emailResult = await sendEmail({
          to: user.email,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        });

        console.log("Email send result:", emailResult);

        if (!emailResult.success) {
          console.error("Email failed to send:", emailResult.error);
        } else {
          console.log(
            "Email sent successfully with ID:",
            emailResult.messageId,
          );
        }
      } catch (err) {
        console.error("Email sending error:", err);
      }

      return NextResponse.json({
        message: "Booking confirmed successfully",
        booking,
      });
    }

    // Handle cancel action (both host and user can cancel)
    if (action === "cancel") {
      // Convert both IDs to strings for comparison
      const bookingUserId = booking.user._id.toString();
      const authenticatedUserId = decoded.userId.toString();

      console.log("Comparing:", { bookingUserId, authenticatedUserId });

      // Check if user is the booking owner
      if (bookingUserId !== authenticatedUserId) {
        // If not the user, check if user is the host of the listing
        const listingDoc = await Listing.findById(booking.listing);
        if (!listingDoc || listingDoc.host.toString() !== authenticatedUserId) {
          console.log("Authorization failed - not owner and not host");
          return NextResponse.json(
            { message: "You are not authorized to cancel this booking" },
            { status: 403 },
          );
        }
      }

      // Check if booking is already cancelled
      if (booking.status === "cancelled") {
        return NextResponse.json(
          { message: "Booking is already cancelled" },
          { status: 400 },
        );
      }

      booking.status = "cancelled";
      await booking.save();

      const user = booking.user;
      const listingData = booking.listing;

      // Get bilingual email content
      const emailContent = getBilingualEmailContent(
        user.name, 
        listingData.title, 
        booking, 
        'cancel'
      );

      try {
        const emailResult = await sendEmail({
          to: user.email,
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
        booking,
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

    // Unwrap params Promise
    const unwrappedParams = await params;
    const bookingId = unwrappedParams.id;

    if (!bookingId) {
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const booking = await Booking.findById(bookingId)
      .populate("listing", "title location price images")
      .populate("user", "name email phoneNumber");

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    // Check if user is authorized to view this booking
    if (booking.user._id.toString() !== decoded.userId) {
      const listingDoc = await Listing.findById(booking.listing);
      if (!listingDoc || listingDoc.host.toString() !== decoded.userId) {
        return NextResponse.json(
          { message: "Unauthorized to view this booking" },
          { status: 403 },
        );
      }
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Fetch booking error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}

// DELETE - Delete booking (admin or host only)
export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Unwrap params Promise
    const unwrappedParams = await params;
    const bookingId = unwrappedParams.id;

    if (!bookingId) {
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    // Check if user is the host or booking owner
    const listingDoc = await Listing.findById(booking.listing);
    const isHost = listingDoc && listingDoc.host.toString() === decoded.userId;
    const isOwner = booking.user.toString() === decoded.userId;

    if (!isHost && !isOwner) {
      return NextResponse.json(
        { message: "Unauthorized to delete this booking" },
        { status: 403 },
      );
    }

    await Booking.findByIdAndDelete(bookingId);

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