// app/api/admin/users/[id]/bookings/route.js - POSTGRESQL VERSION
import { NextResponse } from "next/server";
import pool from "@/lib/postgres";
import { verifyAdminFromCookie } from "@/lib/adminAuth";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    
    // Verify admin access
    const auth = await verifyAdminFromCookie(request, "admin");
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status },
      );
    }

    // Query 1: Bookings made by this user (as guest)
    const bookingsAsGuestResult = await pool.query(
      `SELECT 
        b.id,
        b.check_in,
        b.check_out,
        b.total_price,
        b.guests,
        b.status,
        b.created_at,
        l.id as listing_id,
        l.title as listing_title,
        l.images as listing_images,
        l.location as listing_location,
        l.price as listing_price,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email
       FROM bookings b
       JOIN listings l ON b.listing_id = l.id
       JOIN users u ON b.user_id = u.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );

    // Query 2: Find all listings owned by this user
    const userListingsResult = await pool.query(
      `SELECT id FROM listings WHERE host_id = $1`,
      [userId]
    );
    
    const userListingIds = userListingsResult.rows.map(row => row.id);
    
    // Query 3: Bookings on user's listings (as host)
    let bookingsAsHostResult = { rows: [] };
    
    if (userListingIds.length > 0) {
      bookingsAsHostResult = await pool.query(
        `SELECT 
          b.id,
          b.check_in,
          b.check_out,
          b.total_price,
          b.guests,
          b.status,
          b.created_at,
          l.id as listing_id,
          l.title as listing_title,
          l.images as listing_images,
          l.location as listing_location,
          l.price as listing_price,
          u.id as user_id,
          u.name as user_name,
          u.email as user_email
         FROM bookings b
         JOIN listings l ON b.listing_id = l.id
         JOIN users u ON b.user_id = u.id
         WHERE l.id = ANY($1::UUID[])
         ORDER BY b.created_at DESC`,
        [userListingIds]
      );
    }
    
    // Format bookings as guest
    const bookingsAsGuest = bookingsAsGuestResult.rows.map(booking => ({
      _id: booking.id,
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      totalPrice: booking.total_price,
      guests: booking.guests,
      status: booking.status,
      createdAt: booking.created_at,
      listing: {
        _id: booking.listing_id,
        title: booking.listing_title,
        images: booking.listing_images,
        location: booking.listing_location,
        price: booking.listing_price
      },
      user: {
        _id: booking.user_id,
        name: booking.user_name,
        email: booking.user_email
      }
    }));
    
    // Format bookings as host
    const bookingsAsHost = bookingsAsHostResult.rows.map(booking => ({
      _id: booking.id,
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      totalPrice: booking.total_price,
      guests: booking.guests,
      status: booking.status,
      createdAt: booking.created_at,
      listing: {
        _id: booking.listing_id,
        title: booking.listing_title,
        images: booking.listing_images,
        location: booking.listing_location,
        price: booking.listing_price
      },
      user: {
        _id: booking.user_id,
        name: booking.user_name,
        email: booking.user_email
      }
    }));

    return NextResponse.json({
      success: true,
      bookingsAsGuest,
      bookingsAsHost,
    });
  } catch (error) {
    console.error("GET user bookings error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}