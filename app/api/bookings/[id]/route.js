// app/api/bookings/[id]/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Listing from "@/models/Listing";
import User from "@/models/User";
import { sendEmail } from "@/lib/sendEmail";
import mongoose from "mongoose";

// PUT - Update booking status (confirm or cancel)
export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get("MarhabaToken")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded userId:", decoded.userId);
    console.log("Decoded user ID type:", typeof decoded.userId);

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

    console.log("Booking user ID:", booking.user._id.toString());
    console.log("Booking user ID type:", typeof booking.user._id.toString());
    console.log("Decoded userId for comparison:", decoded.userId.toString());

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

      const html = `
<div style="font-family: Arial; max-width: 600px; margin: auto; padding: 20px;">
  <h2 style="color: #4F46E5;">Booking Confirmed 🎉</h2>
  
  <p>Hi ${user.name},</p>
  
  <p>Your booking has been confirmed!</p>
  
  <div style="background: #f9fafb; padding: 15px; border-radius: 10px; margin-top: 15px;">
    <p><strong>Listing:</strong> ${listingData.title}</p>
    <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toDateString()}</p>
    <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toDateString()}</p>
    <p><strong>Total Price:</strong> $${booking.totalPrice}</p>
  </div>

  <p style="margin-top: 20px;">Enjoy your stay! ✨</p>
</div>
`;

      try {
        await sendEmail({
          to: user.email,
          subject: "Booking Confirmed 🎉",
          text: "Your booking has been confirmed",
          html,
        });
      } catch (err) {
        console.error("Email failed:", err.message);
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

      const html = `
<div style="font-family: Arial; max-width: 600px; margin: auto; padding: 20px;">
  <h2 style="color: #DC2626;">Booking Cancelled ❌</h2>
  
  <p>Hi ${user.name},</p>
  
  <p>Your booking has been cancelled.</p>
  
  <div style="background: #fef2f2; padding: 15px; border-radius: 10px; margin-top: 15px;">
    <p><strong>Listing:</strong> ${listingData.title}</p>
    <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toDateString()}</p>
    <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toDateString()}</p>
  </div>

  <p style="margin-top: 20px;">If you have questions, contact support.</p>
</div>
`;

      try {
        await sendEmail({
          to: user.email,
          subject: "Booking Cancelled ❌",
          text: "Your booking has been cancelled",
          html,
        });
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
    const token = request.cookies.get("MarhabaToken")?.value;

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
    const token = request.cookies.get("MarhabaToken")?.value;

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