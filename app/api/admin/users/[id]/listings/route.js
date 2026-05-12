import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Listing from "@/models/Listing";
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

    const listings = await Listing.find({ host: resolvedParams.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      listings,
    });
  } catch (error) {
    console.error("GET user listings error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}