import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Listing from "@/models/Listing";
import User from "@/models/User";
import { verifyAdminFromCookie } from "@/lib/adminAuth";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    
    // Verify admin access
    const auth = await verifyAdminFromCookie(request, "admin");
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status },
      );
    }

    await connectToDatabase();

    // Bookings made by this user (as guest)
    const bookingsAsGuest = await Booking.find({ user: resolvedParams.id })
      .populate('listing', 'title images location price')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Find all listings owned by this user
    const userListings = await Listing.find({ host: resolvedParams.id }).distinct('_id');
    
    // Bookings on user's listings (as host)
    const bookingsAsHost = await Booking.find({ 
      listing: { $in: userListings } 
    })
      .populate('listing', 'title images location price')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

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