// app/api/admin/users/[id]/listings/route.js - POSTGRESQL VERSION
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

    // Get all listings for this user (host)
    const result = await pool.query(
      `SELECT 
        id,
        title,
        description,
        price,
        location,
        latitude,
        longitude,
        images,
        category,
        amenities,
        rules,
        status,
        blocked_dates,
        created_at,
        updated_at
       FROM listings 
       WHERE host_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    // Format listings to match expected response structure
    const listings = result.rows.map(listing => ({
      _id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      coordinates: {
        lat: listing.latitude,
        lng: listing.longitude
      },
      images: listing.images || [],
      category: listing.category,
      amenities: listing.amenities || [],
      rules: listing.rules || [],
      status: listing.status,
      blockedDates: listing.blocked_dates || [],
      createdAt: listing.created_at,
      updatedAt: listing.updated_at
    }));

    return NextResponse.json({
      success: true,
      listings,
    });
  } catch (error) {
    console.error("GET user listings error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}