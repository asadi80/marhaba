// app/api/bookings/route.js - POSTGRESQL VERSION WITH TIME HANDLING
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/postgres";
import { sendEmail } from "@/lib/sendEmail";

// =====================================================
// CONSTANTS
// =====================================================
const CHECK_IN_TIME = { hour: 13, minute: 30 };  // 1:30 PM
const CHECK_OUT_TIME = { hour: 11, minute: 0 };   // 11:00 AM
const TIMEZONE = 'Africa/Tripoli';  // Libya timezone

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Helper function to get user from cookie
async function getUserFromCookie(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      `SELECT id, name, email, phone_number, role, status FROM users WHERE id = $1`,
      [decoded.userId],
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

// Helper function to create timestamp with specific time
function createTimestampWithTime(dateString, time) {
  // dateString: '2026-05-26'
  // time: { hour: 13, minute: 30 }
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, time.hour, time.minute, 0, 0));
}

// Helper function to format date for email with check-in/out times
const formatDateForEmail = (dateString, type) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: TIMEZONE,
  });
  
  if (type === 'checkin') {
    return `${formattedDate} at 1:30 PM`;
  } else if (type === 'checkout') {
    return `${formattedDate} at 11:00 AM`;
  }
  return formattedDate;
};

// Helper function to format date for display
function formatBookingDate(dateString, type) {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: TIMEZONE
  });
  
  if (type === 'checkin') {
    return `${formattedDate} at 1:30 PM`;
  } else {
    return `${formattedDate} at 11:00 AM`;
  }
}

// Helper function to check if user is host of a listing
async function isUserHostOfListing(userId, listingId) {
  const result = await pool.query(
    `SELECT id FROM listings WHERE id = $1 AND host_id = $2`,
    [listingId, userId],
  );
  return result.rows.length > 0;
}

// Helper function to get host listings
async function getHostListings(hostId) {
  const result = await pool.query(
    `SELECT id FROM listings WHERE host_id = $1`,
    [hostId],
  );
  return result.rows.map((row) => row.id);
}

// Helper function to check date overlap with times
async function checkDateOverlap(listingId, checkInTimestamp, checkOutTimestamp, excludeBookingId = null) {
  // Get all active bookings for this listing
  let query = `
    SELECT id, check_in, check_out, status 
    FROM bookings 
    WHERE listing_id = $1 
    AND status IN ('pending', 'confirmed')
  `;
  
  const params = [listingId];
  
  if (excludeBookingId) {
    query += ` AND id != $2`;
    params.push(excludeBookingId);
  }
  
  const existingBookings = await pool.query(query, params);
  
  // Manual overlap check with proper times
  for (const booking of existingBookings.rows) {
    const existingCheckIn = new Date(booking.check_in);
    const existingCheckOut = new Date(booking.check_out);
    
    // Create timestamps with proper check-in/out times
    const existingStart = createTimestampWithTime(
      existingCheckIn.toISOString().split('T')[0], 
      CHECK_IN_TIME
    );
    const existingEnd = createTimestampWithTime(
      existingCheckOut.toISOString().split('T')[0], 
      CHECK_OUT_TIME
    );
    
    // Check for overlap
    if (checkInTimestamp < existingEnd && checkOutTimestamp > existingStart) {
      return { hasConflict: true, conflictingBooking: booking.id };
    }
  }
  
  return { hasConflict: false };
}

// =====================================================
// EMAIL TEMPLATES
// =====================================================

// Bilingual email template for new booking request to host
function getNewBookingEmailContent(
  host,
  guest,
  listing,
  checkInDate,
  checkOutDate,
  nights,
  totalPrice,
  guests,
) {
  const formattedCheckIn = formatDateForEmail(checkInDate, 'checkin');
  const formattedCheckOut = formatDateForEmail(checkOutDate, 'checkout');

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
      <p>📞 Phone: ${guest.phone_number || "Not provided"}</p>
    </div>
    
    <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/host/bookings" 
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
      <p>📞 رقم الهاتف: ${guest.phone_number || "غير متوفر"}</p>
    </div>
    
    <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/host/bookings" 
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
    `,
  };
}

// Bilingual email template for booking status update to guest
function getStatusUpdateEmailContent(guest, listing, booking, status) {
  const formattedCheckIn = formatDateForEmail(booking.check_in, 'checkin');
  const formattedCheckOut = formatDateForEmail(booking.check_out, 'checkout');
  const isConfirmed = status === "confirmed";
  const statusColor = isConfirmed ? "#22c55e" : "#ef4444";
  const statusText = isConfirmed ? "Confirmed" : "Updated";
  const statusTextAr = isConfirmed ? "تم التأكيد" : "تم التحديث";

  return {
    subject: `Booking ${statusText} / الحجز ${statusTextAr} - ${listing.title}`,
    text: `English: Your booking for ${listing.title} has been ${status}. Check-in: ${formattedCheckIn}, Check-out: ${formattedCheckOut}, Total: ${booking.total_price} LYD\n\nالعربية: تم ${statusTextAr} حجزك لـ ${listing.title}. تسجيل الوصول: ${formattedCheckIn}، تسجيل المغادرة: ${formattedCheckOut}، السعر الإجمالي: ${booking.total_price} دينار`,
    html: `
<div style="font-family: Arial, 'Cairo', 'Tajawal', sans-serif; max-width: 600px; margin: auto; padding: 20px;">
  
  <!-- English Section -->
  <div style="margin-bottom: 30px;">
    <h2 style="color: ${statusColor};">${isConfirmed ? "✅ Booking Confirmed" : "📝 Booking Updated"}</h2>
    
    <p>Dear ${guest.name},</p>
    
    <p>Your booking request for <strong>${listing.title}</strong> has been <strong>${status}</strong> by the host.</p>
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #4F46E5;">Booking Details:</h3>
      <p><strong>🏠 Property:</strong> ${listing.title}</p>
      <p><strong>📍 Location:</strong> ${listing.location}</p>
      <p><strong>📅 Check-in:</strong> ${formattedCheckIn}</p>
      <p><strong>📅 Check-out:</strong> ${formattedCheckOut}</p>
      <p><strong>💰 Total Price:</strong> ${booking.total_price} LYD</p>
      <p><strong>📊 Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status.toUpperCase()}</span></p>
    </div>
    
    <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard" 
       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
      View My Bookings →
    </a>
  </div>
  
  <div style="border-top: 2px solid #e5e7eb; margin: 20px 0;"></div>
  
  <!-- Arabic Section -->
  <div style="direction: rtl; text-align: right;">
    <h2 style="color: ${statusColor};">${isConfirmed ? "✅ تم تأكيد الحجز" : "📝 تم تحديث الحجز"}</h2>
    
    <p>عزيزي ${guest.name}،</p>
    
    <p>تم <strong>${status}</strong> طلب الحجز الخاص بك لـ <strong>${listing.title}</strong> من قبل المضيف.</p>
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #4F46E5;">تفاصيل الحجز:</h3>
      <p><strong>🏠 العقار:</strong> ${listing.title}</p>
      <p><strong>📍 الموقع:</strong> ${listing.location}</p>
      <p><strong>📅 تسجيل الوصول:</strong> ${formattedCheckIn}</p>
      <p><strong>📅 تسجيل المغادرة:</strong> ${formattedCheckOut}</p>
      <p><strong>💰 السعر الإجمالي:</strong> ${booking.total_price} دينار</p>
      <p><strong>📊 الحالة:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status === "confirmed" ? "مؤكد" : "محدث"}</span></p>
    </div>
    
    <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard" 
       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
      عرض حجوزاتي ←
    </a>
  </div>
  
  <div style="border-top: 2px solid #e5e7eb; margin: 20px 0;"></div>
  <p style="color: #6b7280; font-size: 12px; text-align: center;">
    Thank you for choosing Marhaba! / شكراً لاختيارك مرحبا!
  </p>
</div>
    `,
  };
}

// =====================================================
// GET - Fetch bookings (for users and hosts)
// =====================================================
export async function GET(request) {
  try {
    const user = await getUserFromCookie(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let bookings;

    if (user.role === "host") {
      // Host sees bookings for their listings
      const hostListings = await getHostListings(user.id);

      if (hostListings.length === 0) {
        return NextResponse.json({ bookings: [] });
      }

      const result = await pool.query(
        `SELECT b.*, 
                l.title as listing_title, l.location as listing_location, l.price as listing_price, l.images as listing_images,
                u.name as user_name, u.email as user_email, u.phone_number as user_phone
         FROM bookings b
         JOIN listings l ON b.listing_id = l.id
         JOIN users u ON b.user_id = u.id
         WHERE l.id = ANY($1::UUID[])
         ORDER BY b.created_at DESC`,
        [hostListings],
      );
      bookings = result.rows;
    } else {
      // User sees their own bookings
      const result = await pool.query(
        `SELECT b.*, 
                l.title as listing_title, l.location as listing_location, l.price as listing_price, l.images as listing_images,
                l.host_id,
                h.name as host_name, h.email as host_email, h.phone_number as host_phone
         FROM bookings b
         JOIN listings l ON b.listing_id = l.id
         JOIN users h ON l.host_id = h.id
         WHERE b.user_id = $1
         ORDER BY b.created_at DESC`,
        [user.id],
      );
      bookings = result.rows;
    }

    // Format response with display dates
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      listing_id: booking.listing_id,
      user_id: booking.user_id,
      check_in: booking.check_in,
      check_out: booking.check_out,
      check_in_display: formatBookingDate(booking.check_in, 'checkin'),
      check_out_display: formatBookingDate(booking.check_out, 'checkout'),
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
        host: user.role !== "host" ? {
          name: booking.host_name,
          email: booking.host_email,
          phoneNumber: booking.host_phone,
        } : undefined,
      },
      user: user.role === "host" ? {
        name: booking.user_name,
        email: booking.user_email,
        phoneNumber: booking.user_phone,
      } : undefined,
    }));

    return NextResponse.json({ bookings: formattedBookings });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}

// =====================================================
// POST - Create new booking
// =====================================================
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

    // Check if listing exists and get details
    const listingResult = await pool.query(
      `SELECT l.*, u.name as host_name, u.email as host_email, u.phone_number as host_phone
       FROM listings l
       JOIN users u ON l.host_id = u.id
       WHERE l.id = $1`,
      [listingId],
    );

    if (listingResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Listing not found" },
        { status: 404 },
      );
    }

    const listing = listingResult.rows[0];

    // Check if user is trying to book their own listing
    if (listing.host_id === user.id) {
      return NextResponse.json(
        { message: "You cannot book your own listing" },
        { status: 400 },
      );
    }

    // Create timestamps with check-in/out times
    const checkInTimestamp = createTimestampWithTime(checkIn, CHECK_IN_TIME);
    const checkOutTimestamp = createTimestampWithTime(checkOut, CHECK_OUT_TIME);
    
    // Get today's date with check-in time for comparison
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayCheckIn = createTimestampWithTime(todayStr, CHECK_IN_TIME);
    
    // Validate dates
    if (checkInTimestamp >= checkOutTimestamp) {
      return NextResponse.json(
        { message: "Check-out date must be after check-in date" },
        { status: 400 },
      );
    }

    if (checkInTimestamp < todayCheckIn) {
      return NextResponse.json(
        { message: "Cannot book dates in the past" },
        { status: 400 },
      );
    }

    // Calculate nights (based on full days)
    const nights = Math.round((checkOutTimestamp - checkInTimestamp) / (1000 * 60 * 60 * 24));
    if (nights < 1) {
      return NextResponse.json(
        { message: "Minimum stay is 1 night" },
        { status: 400 },
      );
    }

    // Check for date conflicts with proper time handling
    const { hasConflict, conflictingBooking } = await checkDateOverlap(
      listingId, 
      checkInTimestamp, 
      checkOutTimestamp
    );

    if (hasConflict) {
      console.log(`Conflict detected with booking ${conflictingBooking}`);
      return NextResponse.json(
        { message: "Selected dates are not available" },
        { status: 400 },
      );
    }

    // Calculate total price
    const totalPrice = parseFloat(listing.price) * nights;

    // Create booking (store only the date part, no time)
    const bookingResult = await pool.query(
      `INSERT INTO bookings (listing_id, user_id, check_in, check_out, total_price, guests, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [listingId, user.id, checkIn, checkOut, totalPrice, guests || 1],
    );

    const booking = bookingResult.rows[0];

    // Get host details
    const host = {
      name: listing.host_name,
      email: listing.host_email,
      phone_number: listing.host_phone,
    };

    // Send email to host
    const emailContent = getNewBookingEmailContent(
      host,
      user,
      listing,
      checkIn,
      checkOut,
      nights,
      totalPrice,
      guests,
    );

    try {
      await sendEmail({
        to: host.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });
      console.log("Email sent to host:", host.email);
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
    }

    // Format response with display dates
    const formattedBooking = {
      id: booking.id,
      listing_id: booking.listing_id,
      user_id: booking.user_id,
      check_in: booking.check_in,
      check_out: booking.check_out,
      check_in_display: formatBookingDate(booking.check_in, 'checkin'),
      check_out_display: formatBookingDate(booking.check_out, 'checkout'),
      total_price: booking.total_price,
      guests: booking.guests,
      status: booking.status,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      listing: {
        title: listing.title,
        location: listing.location,
        price: listing.price,
        images: listing.images,
      },
    };

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking: formattedBooking,
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

// =====================================================
// PATCH - Update booking status (for hosts)
// =====================================================
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

    if (!["confirmed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status. Use 'confirmed' or 'cancelled'" },
        { status: 400 },
      );
    }

    // Find booking with listing and user info
    const bookingResult = await pool.query(
      `SELECT b.*, 
              l.title as listing_title, l.location as listing_location, l.host_id,
              u.name as guest_name, u.email as guest_email
       FROM bookings b
       JOIN listings l ON b.listing_id = l.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [bookingId],
    );

    if (bookingResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    const booking = bookingResult.rows[0];

    // Check if user is the host of the listing
    if (booking.host_id !== user.id) {
      return NextResponse.json(
        { message: "Unauthorized to update this booking" },
        { status: 403 },
      );
    }

    // Update status
    await pool.query(
      `UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [status, bookingId],
    );

    // Get updated booking
    const updatedBooking = { ...booking, status };

    // Send email notification to guest
    const emailContent = getStatusUpdateEmailContent(
      { name: booking.guest_name, email: booking.guest_email },
      { title: booking.listing_title, location: booking.listing_location },
      updatedBooking,
      status,
    );

    try {
      await sendEmail({
        to: booking.guest_email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });
      console.log("Email sent to guest:", booking.guest_email);
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
    }

    return NextResponse.json({
      message: `Booking ${status} successfully`,
      booking: {
        id: booking.id,
        status: status,
        check_in: booking.check_in,
        check_out: booking.check_out,
        check_in_display: formatBookingDate(booking.check_in, 'checkin'),
        check_out_display: formatBookingDate(booking.check_out, 'checkout'),
        total_price: booking.total_price,
        listing: {
          title: booking.listing_title,
          location: booking.listing_location,
        },
      },
    });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}