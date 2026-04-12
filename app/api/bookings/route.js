import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Listing from "@/models/Listing";
import User from "@/models/User";
import { sendEmail } from "@/lib/sendEmail";

// GET - Fetch bookings (for users and hosts)
export async function GET(request) {
  try {
    const token = request.cookies.get("MarhabaToken")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectToDatabase();

    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let bookings;

    if (user.role === "host") {
      // Host sees bookings for their listings
      const listings = await Listing.find({ host: user._id }).select("_id");
      const listingIds = listings.map((l) => l._id);

      bookings = await Booking.find({ listing: { $in: listingIds } })
        .populate("listing", "title location price images")
        .populate("user", "name email phoneNumber")
        .sort({ createdAt: -1 });
    } else {
      // User sees their own bookings
      bookings = await Booking.find({ user: user._id })
        .populate("listing", "title location price images host")
        .populate("listing.host", "name email phoneNumber")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}

// POST - Create new booking
export async function POST(request) {
  try {
    const token = request.cookies.get("MarhabaToken")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectToDatabase();

    const { listingId, checkIn, checkOut, guests } = await request.json();

    // Validation
    if (!listingId || !checkIn || !checkOut) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return NextResponse.json(
        { message: "Listing not found" },
        { status: 404 },
      );
    }

    // Check if user is trying to book their own listing
    if (listing.host.toString() === decoded.userId) {
      return NextResponse.json(
        { message: "You cannot book your own listing" },
        { status: 400 },
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { message: "Check-out date must be after check-in date" },
        { status: 400 },
      );
    }

    if (checkInDate < new Date()) {
      return NextResponse.json(
        { message: "Cannot book dates in the past" },
        { status: 400 },
      );
    }

    // Check for date conflicts
    const existingBookings = await Booking.find({
      listing: listingId,
      status: { $in: ["confirmed", "pending"] },
      $or: [{ checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }],
    });

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { message: "Selected dates are not available" },
        { status: 400 },
      );
    }

    // Calculate total price
    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = listing.price * nights;

    // Create booking
    const booking = await Booking.create({
      listing: listingId,
      user: decoded.userId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      guests: guests || 1,
      status: "pending",
    });

    // Get host and user details
    const host = await User.findById(listing.host);
    const user = await User.findById(decoded.userId);

    // Create email HTML content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">New Booking Request - Marhaba</h2>
        <p>Dear ${host.name},</p>
        <p>You have received a new booking request from <strong>${user.name}</strong> for your property:</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details:</h3>
          <p><strong>Property:</strong> ${listing.title}</p>
          <p><strong>Location:</strong> ${listing.location}</p>
          <p><strong>Check-in:</strong> ${checkInDate.toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${checkOutDate.toLocaleDateString()}</p>
          <p><strong>Nights:</strong> ${nights}</p>
          <p><strong>Guests:</strong> ${guests || 1}</p>
          <p><strong>Total Price:</strong> $${totalPrice}</p>
          <p><strong>Status:</strong> <span style="color: #eab308;">Pending Confirmation</span></p>
        </div>
        
        <div style="margin: 20px 0;">
          <p><strong>Guest Contact Information:</strong></p>
          <p>📧 Email: ${user.email}</p>
          <p>📞 Phone: ${user.phoneNumber || 'Not provided'}</p>
        </div>
        
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/host/bookings" 
           style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Review Booking Request
        </a>
        
        <hr style="margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">
          Please review and respond to this booking request as soon as possible. 
          The booking will be automatically cancelled if not confirmed within 24 hours.
        </p>
        <p style="color: #6b7280; font-size: 12px;">Thank you for hosting with Marhaba!</p>
      </div>
    `;

    // Send email to host (wrap in try-catch to prevent booking failure if email fails)
    try {
      await sendEmail({
        to: host.email,
        subject: `New Booking Request for ${listing.title}`,
        text: `You have a new booking request from ${user.name} for ${listing.title}. Total: $${totalPrice}. Please log in to your host dashboard to review and confirm the booking.`,
        html: emailHtml,
      });
      console.log('Email sent to host:', host.email);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't return error - booking is still created
    }

    // Populate booking details for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate("listing", "title location price images")
      .populate("user", "name email");

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking: populatedBooking,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}

// PATCH - Update booking status (for hosts)
export async function PATCH(request) {
  try {
    const token = request.cookies.get("MarhabaToken")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectToDatabase();

    const { bookingId, status } = await request.json();

    if (!bookingId || !status) {
      return NextResponse.json(
        { message: "Booking ID and status are required" },
        { status: 400 },
      );
    }

    // Find booking
    const booking = await Booking.findById(bookingId)
      .populate("listing", "host title")
      .populate("user", "name email");

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    // Check if user is the host of the listing
    if (booking.listing.host.toString() !== decoded.userId) {
      return NextResponse.json(
        { message: "Unauthorized to update this booking" },
        { status: 403 },
      );
    }

    // Update status
    booking.status = status;
    await booking.save();

    // Send email notification to user
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Booking ${status === 'confirmed' ? 'Confirmed' : 'Updated'} - Marhaba</h2>
        <p>Dear ${booking.user.name},</p>
        <p>Your booking request for <strong>${booking.listing.title}</strong> has been <strong>${status}</strong> by the host.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details:</h3>
          <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
          <p><strong>Total Price:</strong> $${booking.totalPrice}</p>
          <p><strong>Status:</strong> <span style="color: ${status === 'confirmed' ? '#22c55e' : '#ef4444'};">${status.toUpperCase()}</span></p>
        </div>
        
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
           style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View My Bookings
        </a>
        
        <hr style="margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">Thank you for choosing Marhaba!</p>
      </div>
    `;

    try {
      await sendEmail({
        to: booking.user.email,
        subject: `Booking ${status === 'confirmed' ? 'Confirmed' : 'Updated'} - ${booking.listing.title}`,
        text: `Your booking for ${booking.listing.title} has been ${status}.`,
        html: userEmailHtml,
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    return NextResponse.json({
      message: `Booking ${status} successfully`,
      booking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}