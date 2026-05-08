// app/api/bookings/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Listing from "@/models/Listing";
import User from "@/models/User";
import { sendEmail } from "@/lib/sendEmail";

// Helper function to get user from cookie
async function getUserFromCookie(request) {
  const token = request.cookies.get("token")?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    return user;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

// Helper function to format date for email (English format only)
const formatDateForEmail = (date) => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'UTC'
  });
};

// Bilingual email template for new booking request to host
function getNewBookingEmailContent(host, guest, listing, checkInUTC, checkOutUTC, nights, totalPrice, guests) {
  const formattedCheckIn = formatDateForEmail(checkInUTC);
  const formattedCheckOut = formatDateForEmail(checkOutUTC);
  
  return {
    subject: `New Booking Request / طلب حجز جديد - ${listing.title}`,
    text: `English: New booking request from ${guest.name} for ${listing.title}. Check-in: ${formattedCheckIn}, Check-out: ${formattedCheckOut}, Total: ${totalPrice} LYD\n\nالعربية: طلب حجز جديد من ${guest.name} لـ ${listing.title}. تسجيل الوصول: ${formattedCheckIn}، تسجيل المغادرة: ${formattedCheckOut}، السعر الإجمالي: ${totalPrice} دينار`,
    html: `
<div style="font-family: Arial, 'Cairo', 'Tajawal', sans-serif; max-width: 600px; margin: auto; padding: 20px;">
  
  <!-- English Section -->
  <div style="margin-bottom: 30px;">
    <h2 style="color: #4F46E5;">🏠 New Booking Request</h2>
    
    <p>Dear ${host.name},</p>
    
    <p>You have received a new booking request from <strong>${guest.name}</strong> for your property:</p>
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #4F46E5;">Booking Details:</h3>
      <p><strong>🏠 Property:</strong> ${listing.title}</p>
      <p><strong>📍 Location:</strong> ${listing.location}</p>
      <p><strong>📅 Check-in:</strong> ${formattedCheckIn}</p>
      <p><strong>📅 Check-out:</strong> ${formattedCheckOut}</p>
      <p><strong>🌙 Nights:</strong> ${nights}</p>
      <p><strong>👥 Guests:</strong> ${guests || 1}</p>
      <p><strong>💰 Total Price:</strong> ${totalPrice} LYD</p>
      <p><strong>📊 Status:</strong> <span style="color: #eab308;">Pending Confirmation</span></p>
    </div>
    
    <div style="margin: 20px 0; background: #e0e7ff; padding: 15px; border-radius: 8px;">
      <p><strong>👤 Guest Contact Information:</strong></p>
      <p>📧 Email: ${guest.email}</p>
      <p>📞 Phone: ${guest.phoneNumber || 'Not provided'}</p>
    </div>
    
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/host/bookings" 
       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
      Review Booking Request →
    </a>
    
    <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
      Please review and respond to this booking request as soon as possible.
    </p>
  </div>
  
  <div style="border-top: 2px solid #e5e7eb; margin: 20px 0;"></div>
  
  <!-- Arabic Section -->
  <div style="direction: rtl; text-align: right;">
    <h2 style="color: #4F46E5;">🏠 طلب حجز جديد</h2>
    
    <p>عزيزي ${host.name}،</p>
    
    <p>لقد تلقيت طلب حجز جديد من <strong>${guest.name}</strong> لعقارك:</p>
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #4F46E5;">تفاصيل الحجز:</h3>
      <p><strong>🏠 العقار:</strong> ${listing.title}</p>
      <p><strong>📍 الموقع:</strong> ${listing.location}</p>
      <p><strong>📅 تسجيل الوصول:</strong> ${formattedCheckIn}</p>
      <p><strong>📅 تسجيل المغادرة:</strong> ${formattedCheckOut}</p>
      <p><strong>🌙 عدد الليالي:</strong> ${nights}</p>
      <p><strong>👥 عدد الضيوف:</strong> ${guests || 1}</p>
      <p><strong>💰 السعر الإجمالي:</strong> ${totalPrice} دينار</p>
      <p><strong>📊 الحالة:</strong> <span style="color: #eab308;">في انتظار التأكيد</span></p>
    </div>
    
    <div style="margin: 20px 0; background: #e0e7ff; padding: 15px; border-radius: 8px;">
      <p><strong>👤 معلومات الاتصال بالضيف:</strong></p>
      <p>📧 البريد الإلكتروني: ${guest.email}</p>
      <p>📞 رقم الهاتف: ${guest.phoneNumber || 'غير متوفر'}</p>
    </div>
    
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/host/bookings" 
       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
      مراجعة طلب الحجز ←
    </a>
    
    <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
      يرجى مراجعة طلب الحجز هذا والرد عليه في أقرب وقت ممكن.
    </p>
  </div>
  
  <div style="border-top: 2px solid #e5e7eb; margin: 20px 0;"></div>
  <p style="color: #6b7280; font-size: 12px; text-align: center;">
    Thank you for hosting with Marhaba! / شكراً لاستضافتك مع مرحبا!
  </p>
</div>
    `
  };
}

// Bilingual email template for booking status update to guest
function getStatusUpdateEmailContent(guest, listing, booking, status) {
  const formattedCheckIn = formatDateForEmail(booking.checkIn);
  const formattedCheckOut = formatDateForEmail(booking.checkOut);
  const isConfirmed = status === 'confirmed';
  const statusColor = isConfirmed ? '#22c55e' : '#ef4444';
  const statusText = isConfirmed ? 'Confirmed' : 'Updated';
  const statusTextAr = isConfirmed ? 'تم التأكيد' : 'تم التحديث';
  
  return {
    subject: `Booking ${statusText} / الحجز ${statusTextAr} - ${listing.title}`,
    text: `English: Your booking for ${listing.title} has been ${status}. Check-in: ${formattedCheckIn}, Check-out: ${formattedCheckOut}, Total: ${booking.totalPrice} LYD\n\nالعربية: تم ${statusTextAr} حجزك لـ ${listing.title}. تسجيل الوصول: ${formattedCheckIn}، تسجيل المغادرة: ${formattedCheckOut}، السعر الإجمالي: ${booking.totalPrice} دينار`,
    html: `
<div style="font-family: Arial, 'Cairo', 'Tajawal', sans-serif; max-width: 600px; margin: auto; padding: 20px;">
  
  <!-- English Section -->
  <div style="margin-bottom: 30px;">
    <h2 style="color: ${statusColor};">${isConfirmed ? '✅ Booking Confirmed' : '📝 Booking Updated'}</h2>
    
    <p>Dear ${guest.name},</p>
    
    <p>Your booking request for <strong>${listing.title}</strong> has been <strong>${status}</strong> by the host.</p>
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #4F46E5;">Booking Details:</h3>
      <p><strong>🏠 Property:</strong> ${listing.title}</p>
      <p><strong>📍 Location:</strong> ${listing.location}</p>
      <p><strong>📅 Check-in:</strong> ${formattedCheckIn}</p>
      <p><strong>📅 Check-out:</strong> ${formattedCheckOut}</p>
      <p><strong>💰 Total Price:</strong> ${booking.totalPrice} LYD</p>
      <p><strong>📊 Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status.toUpperCase()}</span></p>
    </div>
    
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
      View My Bookings →
    </a>
  </div>
  
  <div style="border-top: 2px solid #e5e7eb; margin: 20px 0;"></div>
  
  <!-- Arabic Section -->
  <div style="direction: rtl; text-align: right;">
    <h2 style="color: ${statusColor};">${isConfirmed ? '✅ تم تأكيد الحجز' : '📝 تم تحديث الحجز'}</h2>
    
    <p>عزيزي ${guest.name}،</p>
    
    <p>تم <strong>${status}</strong> طلب الحجز الخاص بك لـ <strong>${listing.title}</strong> من قبل المضيف.</p>
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #4F46E5;">تفاصيل الحجز:</h3>
      <p><strong>🏠 العقار:</strong> ${listing.title}</p>
      <p><strong>📍 الموقع:</strong> ${listing.location}</p>
      <p><strong>📅 تسجيل الوصول:</strong> ${formattedCheckIn}</p>
      <p><strong>📅 تسجيل المغادرة:</strong> ${formattedCheckOut}</p>
      <p><strong>💰 السعر الإجمالي:</strong> ${booking.totalPrice} دينار</p>
      <p><strong>📊 الحالة:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status === 'confirmed' ? 'مؤكد' : 'محدث'}</span></p>
    </div>
    
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
      عرض حجوزاتي ←
    </a>
  </div>
  
  <div style="border-top: 2px solid #e5e7eb; margin: 20px 0;"></div>
  <p style="color: #6b7280; font-size: 12px; text-align: center;">
    Thank you for choosing Marhaba! / شكراً لاختيارك مرحبا!
  </p>
</div>
    `
  };
}

// GET - Fetch bookings (for users and hosts)
export async function GET(request) {
  try {
    const user = await getUserFromCookie(request);
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
    const user = await getUserFromCookie(request);
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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
    if (listing.host.toString() === user._id.toString()) {
      return NextResponse.json(
        { message: "You cannot book your own listing" },
        { status: 400 },
      );
    }

    // Parse the date strings (they come as YYYY-MM-DD from frontend)
    const [checkInYear, checkInMonth, checkInDay] = checkIn.split('-').map(Number);
    const [checkOutYear, checkOutMonth, checkOutDay] = checkOut.split('-').map(Number);
    
    // Create dates at UTC midnight for storage
    const checkInUTC = new Date(Date.UTC(checkInYear, checkInMonth - 1, checkInDay, 0, 0, 0));
    const checkOutUTC = new Date(Date.UTC(checkOutYear, checkOutMonth - 1, checkOutDay, 0, 0, 0));
    
    // Get today's date in UTC for comparison
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0));
    
    // Validate dates
    if (checkInUTC >= checkOutUTC) {
      return NextResponse.json(
        { message: "Check-out date must be after check-in date" },
        { status: 400 },
      );
    }

    if (checkInUTC < todayUTC) {
      return NextResponse.json(
        { message: "Cannot book dates in the past" },
        { status: 400 },
      );
    }

    // Check for date conflicts
    const existingBookings = await Booking.find({
      listing: listingId,
      status: { $in: ["confirmed", "pending"] },
      $or: [
        { checkIn: { $lt: checkOutUTC }, checkOut: { $gt: checkInUTC } }
      ],
    });

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { message: "Selected dates are not available" },
        { status: 400 },
      );
    }

    // Calculate total price
    const nights = Math.ceil(
      (checkOutUTC - checkInUTC) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = listing.price * nights;

    // Create booking with UTC dates
    const booking = await Booking.create({
      listing: listingId,
      user: user._id,
      checkIn: checkInUTC,
      checkOut: checkOutUTC,
      totalPrice,
      guests: guests || 1,
      status: "pending",
    });

    // Get host details
    const host = await User.findById(listing.host);

    // Get bilingual email content for host
    const emailContent = getNewBookingEmailContent(
      host, 
      user, 
      listing, 
      checkInUTC, 
      checkOutUTC, 
      nights, 
      totalPrice, 
      guests
    );

    // Send email to host
    try {
      await sendEmail({
        to: host.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });
      console.log('Email sent to host:', host.email);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
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
    const user = await getUserFromCookie(request);
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, status } = await request.json();

    if (!bookingId || !status) {
      return NextResponse.json(
        { message: "Booking ID and status are required" },
        { status: 400 },
      );
    }

    // Find booking
    const booking = await Booking.findById(bookingId)
      .populate("listing", "host title location")
      .populate("user", "name email");

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    // Check if user is the host of the listing
    if (booking.listing.host.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: "Unauthorized to update this booking" },
        { status: 403 },
      );
    }

    // Update status
    booking.status = status;
    await booking.save();

    // Get bilingual email content for guest
    const emailContent = getStatusUpdateEmailContent(
      booking.user,
      booking.listing,
      booking,
      status
    );

    // Send email notification to user
    try {
      await sendEmail({
        to: booking.user.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });
      console.log('Email sent to guest:', booking.user.email);
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