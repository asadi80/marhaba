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
    
    let query = {};
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    
    const listings = await Listing.find(query)
      .populate('host', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ listings });
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
    
    // Extract data from request body
    const { title, description, price, location, coordinates, images, amenities,  rules, category } = await request.json();
    
    console.log('Received listing data:', { title, description, price, location, coordinates, images, amenities,rules, category }); // Debug log
    
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
    
    const listing = await Listing.create({
      title,
      description,
      price: parseFloat(price),
      location,
      coordinates: {
        lat: parseFloat(coordinates.lat),
        lng: parseFloat(coordinates.lng),
      },
      images: images.filter(img => img && img.trim() !== ''), // Remove empty image URLs
      amenities: amenities || [],
      host: user._id,
      rules: rules || [],
      category: category || 'city'
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