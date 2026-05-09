// app/api/listings/[id]/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import Listing from '@/models/Listing';
import Booking from '@/models/Booking';
import mongoose from 'mongoose';

// GET - Fetch single listing with its booked and blocked dates (public)
export async function GET(request, { params }) {
  try {
    console.log('=== GET Listing API Called ===');
    const unwrappedParams = await params;
    const { id } = unwrappedParams;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Listing ID is required' },
        { status: 400 }
      );
    }
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid listing ID format' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const listing = await Listing.findById(id)
      .populate('host', 'name email hostDetails');
    
    if (!listing) {
      return NextResponse.json(
        { message: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Get bookings (confirmed and pending) - only for authenticated users or just public info
    const token = request.cookies.get('token')?.value;
    let bookedDates = [];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Only show booked dates if user is authenticated (for booking purposes)
        const bookings = await Booking.find({
          listing: id,
          status: { $in: ['confirmed', 'pending'] }
        }).select('checkIn checkOut status');
        
        bookedDates = bookings.map(booking => ({
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          status: booking.status,
        }));
      } catch (e) {
        // If token is invalid, still show public info
        console.log('Invalid token for listing view');
      }
    }
    
    // Add blocked dates from listing
    const blockedDates = (listing.blockedDates || []).map(block => ({
      checkIn: block.startDate,
      checkOut: block.endDate,
      status: 'blocked',
      reason: block.reason,
    }));
    
    // Combine both booked and blocked dates (only if authenticated)
    const allUnavailableDates = token ? [...bookedDates, ...blockedDates] : blockedDates;
    
    return NextResponse.json({
      listing,
      bookedDates: allUnavailableDates,
    });
  } catch (error) {
    console.error('=== ERROR in GET listing API ===');
    console.error('Error:', error);
    
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT - Update listing (including blocked dates) - Host only
export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const unwrappedParams = await params;
    const { id } = unwrappedParams;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Listing ID is required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const listing = await Listing.findById(id);
    
    if (!listing) {
      return NextResponse.json(
        { message: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the host
    if (listing.host.toString() !== decoded.userId) {
      return NextResponse.json(
        { message: 'You can only update your own listings' },
        { status: 403 }
      );
    }
    
    const { title, description, price, location, images, amenities, blockedDates, rules, coordinates, category } = await request.json();
    
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { 
        title, 
        description, 
        price, 
        location, 
        coordinates,
        images, 
        rules,
        amenities,
        category: category || listing.category,
        blockedDates: blockedDates || listing.blockedDates || []
      },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      message: 'Listing updated successfully',
      listing: updatedListing,
    });
  } catch (error) {
    console.error('Update listing error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Add blocked dates (host only)
export async function POST(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const unwrappedParams = await params;
    const { id } = unwrappedParams;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Listing ID is required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const listing = await Listing.findById(id);
    
    if (!listing) {
      return NextResponse.json(
        { message: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the host
    if (listing.host.toString() !== decoded.userId) {
      return NextResponse.json(
        { message: 'Only the host can block dates' },
        { status: 403 }
      );
    }
    
    const { startDate, endDate, reason } = await request.json();
    
    // Validate dates
    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: 'Both start and end dates are required' },
        { status: 400 }
      );
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
      return NextResponse.json(
        { message: 'Cannot block past dates' },
        { status: 400 }
      );
    }
    
    if (start >= end) {
      return NextResponse.json(
        { message: 'End date must be after start date' },
        { status: 400 }
      );
    }
    
    // Ensure blockedDates is an array
    if (!listing.blockedDates) {
      listing.blockedDates = [];
    }
    
    // Check if dates are already blocked
    const isDateBlocked = listing.blockedDates.some(block => {
      const blockStart = new Date(block.startDate);
      const blockEnd = new Date(block.endDate);
      return (start < blockEnd && end > blockStart);
    });
    
    if (isDateBlocked) {
      return NextResponse.json(
        { message: 'These dates are already blocked' },
        { status: 400 }
      );
    }
    
    // Check if dates are already booked
    const bookings = await Booking.find({
      listing: id,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { checkIn: { $lt: end }, checkOut: { $gt: start } }
      ],
    });
    
    if (bookings.length > 0) {
      return NextResponse.json(
        { message: 'Cannot block dates that have existing bookings' },
        { status: 400 }
      );
    }
    
    // Add the blocked dates
    listing.blockedDates.push({
      startDate: start,
      endDate: end,
      reason: reason || 'Blocked by host',
      createdAt: new Date(),
    });
    
    await listing.save();
    
    return NextResponse.json({
      message: 'Dates blocked successfully',
      blockedDates: listing.blockedDates,
    });
  } catch (error) {
    console.error('Block dates error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove blocked dates OR delete entire listing
export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const unwrappedParams = await params;
    const { id } = unwrappedParams;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Listing ID is required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const listing = await Listing.findById(id);
    
    if (!listing) {
      return NextResponse.json(
        { message: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the host
    if (listing.host.toString() !== decoded.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Check if this is a delete listing request
    const url = new URL(request.url);
    const deleteListing = url.searchParams.get('deleteListing');
    
    // If deleteListing=true, delete the entire listing
    if (deleteListing === 'true') {
      // Delete the listing
      await Listing.findByIdAndDelete(id);
      // Delete all associated bookings
      await Booking.deleteMany({ listing: id });
      
      return NextResponse.json({
        message: 'Listing deleted successfully',
      });
    }
    
    // Otherwise, try to parse body for blockId (remove blocked date)
    let blockId;
    try {
      const body = await request.json();
      blockId = body.blockId;
    } catch (e) {
      // If no body and not deleteListing, return error
      return NextResponse.json(
        { message: 'Missing blockId or deleteListing parameter' },
        { status: 400 }
      );
    }
    
    if (!blockId) {
      return NextResponse.json(
        { message: 'Block ID is required' },
        { status: 400 }
      );
    }
    
    // Ensure blockedDates is an array
    if (!listing.blockedDates) {
      listing.blockedDates = [];
    }
    
    // Remove the blocked date range
    listing.blockedDates = listing.blockedDates.filter(
      block => block._id.toString() !== blockId
    );
    
    await listing.save();
    
    return NextResponse.json({
      message: 'Blocked dates removed successfully',
      blockedDates: listing.blockedDates,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}