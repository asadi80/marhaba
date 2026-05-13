import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import Listing from '@/models/Listing';
import User from '@/models/User';

// GET - Fetch all listings (for users)
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    // Build query - Only show active listings
    let query = {
      $or: [
        { status: 'active' },
        { status: { $exists: false } } // For backward compatibility with old listings
      ]
    };
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    
    // Fetch listings and populate host to check their status
    const listings = await Listing.find(query)
      .populate('host', 'name email status role') // Include host status
      .sort({ createdAt: -1 })
      .lean();
    
    // Filter out listings where:
    // 1. Host is suspended
    // 2. Host doesn't exist
    // 3. Host is not a host role
    const activeListings = listings.filter(listing => {
      // Check if host exists and is not suspended
      if (!listing.host) return false;
      if (listing.host.status === 'suspended') return false;
      if (listing.host.role !== 'host') return false;
      
      // Check if listing is not deleted/suspended (if status field exists)
      if (listing.status === 'suspended' || listing.status === 'deleted') return false;
      
      return true;
    });
    
    return NextResponse.json({ listings: activeListings });
  } catch (error) {
    console.error('Fetch listings error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new listing (host only)
export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is a host
    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'host') {
      return NextResponse.json(
        { message: 'Only hosts can create listings' },
        { status: 403 }
      );
    }
    
    // Check if host is suspended
    if (user.status === 'suspended') {
      return NextResponse.json(
        { message: 'Your account is suspended. You cannot create listings.' },
        { status: 403 }
      );
    }
    
    // Check if host is confirmed (for host role)
    if (user.role === 'host' && user.status !== 'confirmed') {
      return NextResponse.json(
        { message: 'Your host account is not confirmed yet. Please wait for admin approval.' },
        { status: 403 }
      );
    }
    
    // Extract data from request body
    const { title, description, price, location, coordinates, images, amenities, rules, category } = await request.json();
    
    console.log('Received listing data:', { title, description, price, location, coordinates, images, amenities, rules, category });
    
    // Validation
    if (!title || !description || !price || !location || !coordinates) {
      return NextResponse.json(
        { message: 'All required fields must be filled' },
        { status: 400 }
      );
    }
    
    // Validate coordinates
    if (!coordinates.lat || !coordinates.lng) {
      return NextResponse.json(
        { message: 'Valid coordinates are required' },
        { status: 400 }
      );
    }
    
    // Validate images
    if (!images || images.length === 0 || !images[0]) {
      return NextResponse.json(
        { message: 'At least one image is required' },
        { status: 400 }
      );
    }
    
    // Create listing with active status by default
    const listing = await Listing.create({
      title,
      description,
      price: parseFloat(price),
      location,
      coordinates: {
        lat: parseFloat(coordinates.lat),
        lng: parseFloat(coordinates.lng),
      },
      images: images.filter(img => img && img.trim() !== ''),
      amenities: amenities || [],
      host: user._id,
      rules: rules || [],
      category: category || 'city',
      status: 'active' // Set initial status to active
    });
    
    // Update host's total listings count
    if (user.hostDetails) {
      user.hostDetails.totalListings += 1;
      await user.save();
    }
    
    return NextResponse.json({
      message: 'Listing created successfully',
      listing,
    }, { status: 201 });
  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update listing (host only)
export async function PUT(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'host') {
      return NextResponse.json(
        { message: 'Only hosts can update listings' },
        { status: 403 }
      );
    }
    
    // Check if host is suspended
    if (user.status === 'suspended') {
      return NextResponse.json(
        { message: 'Your account is suspended. You cannot update listings.' },
        { status: 403 }
      );
    }
    
    const { listingId, ...updateData } = await request.json();
    
    if (!listingId) {
      return NextResponse.json(
        { message: 'Listing ID is required' },
        { status: 400 }
      );
    }
    
    // Find the listing and check ownership
    const listing = await Listing.findById(listingId);
    
    if (!listing) {
      return NextResponse.json(
        { message: 'Listing not found' },
        { status: 404 }
      );
    }
    
    if (listing.host.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: 'You can only update your own listings' },
        { status: 403 }
      );
    }
    
    // Check if listing is not deleted
    if (listing.status === 'deleted') {
      return NextResponse.json(
        { message: 'Cannot update a deleted listing' },
        { status: 403 }
      );
    }
    
    // Update the listing
    Object.assign(listing, updateData);
    await listing.save();
    
    return NextResponse.json({
      message: 'Listing updated successfully',
      listing,
    });
  } catch (error) {
    console.error('Update listing error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete listing (host only)
export async function DELETE(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'host') {
      return NextResponse.json(
        { message: 'Only hosts can delete listings' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('id');
    
    if (!listingId) {
      return NextResponse.json(
        { message: 'Listing ID is required' },
        { status: 400 }
      );
    }
    
    // Find the listing and check ownership
    const listing = await Listing.findById(listingId);
    
    if (!listing) {
      return NextResponse.json(
        { message: 'Listing not found' },
        { status: 404 }
      );
    }
    
    if (listing.host.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: 'You can only delete your own listings' },
        { status: 403 }
      );
    }
    
    // Soft delete by setting status to 'deleted'
    listing.status = 'deleted';
    await listing.save();
    
    // Update host's total listings count
    if (user.hostDetails && user.hostDetails.totalListings > 0) {
      user.hostDetails.totalListings -= 1;
      await user.save();
    }
    
    return NextResponse.json({
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}