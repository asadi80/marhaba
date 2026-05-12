import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Listing from "@/models/Listing";
import Booking from "@/models/Booking";
import { verifyAdminFromCookie } from "@/lib/adminAuth";

// Get single user
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    
    // Verify admin using cookie
    const auth = await verifyAdminFromCookie(request, "admin");
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status },
      );
    }

    await connectToDatabase();

    const user = await User.findById(resolvedParams.id).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("GET user error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Update user
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    
    // Verify admin using cookie
    const auth = await verifyAdminFromCookie(request, "admin");
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status },
      );
    }

    const body = await request.json();
    const { name, email, phoneNumber, role, status } = body;

    await connectToDatabase();

    const user = await User.findById(resolvedParams.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check permissions for modifying roles
    if (auth.user.role === "admin") {
      // Admin cannot modify other admins or super admins
      if (user.role === "admin" || user.role === "super_admin") {
        return NextResponse.json(
          { message: "Admins cannot modify other admin users" },
          { status: 403 },
        );
      }
      // Admin cannot change role to admin or super_admin
      if (role && (role === "admin" || role === "super_admin")) {
        return NextResponse.json(
          { message: "Admins cannot promote users to admin roles" },
          { status: 403 },
        );
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    // Update role (only super_admin)
    if (role && auth.user.role === "super_admin") {
      user.role = role;
    }

    // Safe status handling
    if (status && auth.user.role === 'super_admin') {
      const previousStatus = user.status;
      user.status = status;

      // Host confirmed
      if (status === 'confirmed' && user.role === 'host') {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 6);
        user.hostExpiryDate = expiry;
        user.statusReason = null;
      }

      // Manual pending
      if (status === 'pending') {
        user.statusReason = 'manual_pending';
      }

      // Suspended - suspend all listings and bookings
      if (status === 'suspended') {
        user.hostExpiryDate = null;
        user.statusReason = 'admin_suspended';
        
        // Suspend all user's listings
        await Listing.updateMany(
          { host: user._id },
          { status: 'suspended' }
        );
        
        // Cancel all pending bookings for this user's listings
        await Booking.updateMany(
          { 
            listing: { $in: await Listing.find({ host: user._id }).distinct('_id') },
            status: 'pending'
          },
          { status: 'cancelled' }
        );
        
        // Cancel all bookings made by this user
        await Booking.updateMany(
          { user: user._id, status: 'pending' },
          { status: 'cancelled' }
        );
      }
      
      // Reactivated from suspension - reactivate listings
      if (previousStatus === 'suspended' && status !== 'suspended') {
        await Listing.updateMany(
          { host: user._id },
          { status: 'active' }
        );
      }
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("PUT user error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Delete user - delete all listings and bookings
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;

    // Verify super_admin using cookie
    const auth = await verifyAdminFromCookie(request, "super_admin");
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status },
      );
    }

    if (!resolvedParams?.id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(resolvedParams.id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent deleting yourself
    if (user._id.toString() === auth.user._id.toString()) {
      return NextResponse.json(
        { message: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    // Start a session for transaction to ensure all operations succeed or fail together
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find all listings by this user
      const userListings = await Listing.find({ host: user._id }).session(session);
      const listingIds = userListings.map(listing => listing._id);
      
      // Delete all bookings for these listings
      if (listingIds.length > 0) {
        await Booking.deleteMany(
          { listing: { $in: listingIds } },
          { session }
        );
      }
      
      // Delete all bookings made by this user
      await Booking.deleteMany(
        { user: user._id },
        { session }
      );
      
      // Delete all listings by this user
      await Listing.deleteMany(
        { host: user._id },
        { session }
      );
      
      // Finally delete the user
      await user.deleteOne({ session });
      
      // Commit the transaction
      await session.commitTransaction();
      
      return NextResponse.json({
        success: true,
        message: "User and all associated listings and bookings deleted successfully",
        deletedCount: {
          listings: listingIds.length,
          bookings: await Booking.countDocuments({ user: user._id })
        }
      });
    } catch (error) {
      // Rollback transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}