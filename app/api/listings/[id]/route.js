// app/api/listings/[id]/route.js - POSTGRESQL VERSION
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/postgres';

// Helper function to check if a UUID is valid
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// GET - Fetch single listing with its booked and blocked dates (public)
export async function GET(request, { params }) {
  
  try {
    console.log('=== GET Listing API Called ===');
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Listing ID is required' },
        { status: 400 }
      );
    }
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { message: 'Invalid listing ID format' },
        { status: 400 }
      );
    }
    
    // Get listing with host info
    const listingResult = await pool.query(
      `SELECT l.*, 
              u.name as host_name, u.email as host_email, u.host_details
       FROM listings l
       JOIN users u ON l.host_id = u.id
       WHERE l.id = $1`,
      [id]
    );
    
    if (listingResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Listing not found' },
        { status: 404 }
      );
    }
    
    const listing = listingResult.rows[0];
    
    // Get blocked dates from listing
    let blockedDates = [];
    if (listing.blocked_dates) {
      blockedDates = typeof listing.blocked_dates === 'string' 
        ? JSON.parse(listing.blocked_dates) 
        : listing.blocked_dates;
    }
    
    const formattedBlockedDates = blockedDates.map(block => ({
      checkIn: block.startdate || block.startDate,
      checkOut: block.enddate || block.endDate,
      status: 'blocked',
      reason: block.reason,
    }));
    
    // Get booked dates if authenticated
    const token = request.cookies.get('token')?.value;
    let bookedDates = [];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const bookingsResult = await pool.query(
          `SELECT check_in, check_out, status 
           FROM bookings 
           WHERE listing_id = $1 
           AND status IN ('confirmed', 'pending')`,
          [id]
        );
        
        bookedDates = bookingsResult.rows.map(booking => ({
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          status: booking.status,
        }));
      } catch (e) {
        console.log('Invalid token for listing view');
      }
    }
    
    // Combine both booked and blocked dates
    const allUnavailableDates = token 
      ? [...bookedDates, ...formattedBlockedDates]
      : formattedBlockedDates;
    
    // Format listing response
    const formattedListing = {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      latitude: listing.latitude,
      longitude: listing.longitude,
      images: listing.images,
      category: listing.category,
      amenities: listing.amenities,
      rules: listing.rules,
      status: listing.status,
      created_at: listing.created_at,
      updated_at: listing.updated_at,
      host: {
        id: listing.host_id,
        name: listing.host_name,
        email: listing.host_email,
        hostDetails: listing.host_details,
      },
       view_count: listing.view_count,
      blocked_dates: listing.blocked_dates,
    };
    
    return NextResponse.json({
      listing: formattedListing,
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
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Listing ID is required' },
        { status: 400 }
      );
    }
    
    // Check if listing exists and belongs to host
    const listingResult = await pool.query(
      `SELECT id, host_id FROM listings WHERE id = $1`,
      [id]
    );
    
    if (listingResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Listing not found' },
        { status: 404 }
      );
    }
    
    const listing = listingResult.rows[0];
    
    if (listing.host_id !== decoded.userId) {
      return NextResponse.json(
        { message: 'You can only update your own listings' },
        { status: 403 }
      );
    }
    
    const { 
      title, description, price, location, images, 
      amenities, blockedDates, rules, coordinates, category 
    } = await request.json();
    
    // Update listing
    const result = await pool.query(
      `UPDATE listings 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           location = COALESCE($4, location),
           latitude = COALESCE($5, latitude),
           longitude = COALESCE($6, longitude),
           images = COALESCE($7, images),
           amenities = COALESCE($8, amenities),
           rules = COALESCE($9, rules),
           category = COALESCE($10, category),
           blocked_dates = COALESCE($11, blocked_dates),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [
        title, description, price, location,
        coordinates?.lat || null, coordinates?.lng || null,
        images, amenities, rules, category,
        blockedDates || listing.blocked_dates,
        id
      ]
    );
    
    return NextResponse.json({
      message: 'Listing updated successfully',
      listing: result.rows[0],
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
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Listing ID is required' },
        { status: 400 }
      );
    }
    
    // Get listing
    const listingResult = await pool.query(
      `SELECT id, host_id, blocked_dates FROM listings WHERE id = $1`,
      [id]
    );
    
    if (listingResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Listing not found' },
        { status: 404 }
      );
    }
    
    const listing = listingResult.rows[0];
    
    // Check if user is the host
    if (listing.host_id !== decoded.userId) {
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
    
    // Parse existing blocked dates
    let blockedDates = listing.blocked_dates || [];
    if (typeof blockedDates === 'string') {
      blockedDates = JSON.parse(blockedDates);
    }
    
    // Check if dates are already blocked
    const isDateBlocked = blockedDates.some(block => {
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
    const bookingsResult = await pool.query(
      `SELECT id FROM bookings 
       WHERE listing_id = $1 
       AND status IN ('confirmed', 'pending')
       AND check_in < $2 
       AND check_out > $3`,
      [id, end, start]
    );
    
    if (bookingsResult.rows.length > 0) {
      return NextResponse.json(
        { message: 'Cannot block dates that have existing bookings' },
        { status: 400 }
      );
    }
    
    // Add new blocked date
    const newBlock = {
      startDate: start,
      endDate: end,
      reason: reason || 'Blocked by host',
      createdAt: new Date(),
    };
    
    blockedDates.push(newBlock);
    
    // Update listing
    await pool.query(
      `UPDATE listings 
       SET blocked_dates = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [JSON.stringify(blockedDates), id]
    );
    
    return NextResponse.json({
      message: 'Dates blocked successfully',
      blockedDates: blockedDates,
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
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Listing ID is required' },
        { status: 400 }
      );
    }
    
    // Get listing
    const listingResult = await pool.query(
      `SELECT id, host_id, blocked_dates FROM listings WHERE id = $1`,
      [id]
    );
    
    if (listingResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Listing not found' },
        { status: 404 }
      );
    }
    
    const listing = listingResult.rows[0];
    
    // Check if user is the host
    if (listing.host_id !== decoded.userId) {
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
      // Delete all associated bookings first
      await pool.query(`DELETE FROM bookings WHERE listing_id = $1`, [id]);
      // Delete the listing
      await pool.query(`DELETE FROM listings WHERE id = $1`, [id]);
      
      return NextResponse.json({
        message: 'Listing deleted successfully',
      });
    }
    
    // Otherwise, try to parse body for blockIndex (remove blocked date)
    let blockIndex;
    try {
      const body = await request.json();
      blockIndex = body.blockIndex;
    } catch (e) {
      return NextResponse.json(
        { message: 'Missing blockIndex or deleteListing parameter' },
        { status: 400 }
      );
    }
    
    if (blockIndex === undefined) {
      return NextResponse.json(
        { message: 'Block index is required' },
        { status: 400 }
      );
    }
    
    // Parse existing blocked dates
    let blockedDates = listing.blocked_dates || [];
    if (typeof blockedDates === 'string') {
      blockedDates = JSON.parse(blockedDates);
    }
    
    // Remove the blocked date by index
    if (blockIndex >= 0 && blockIndex < blockedDates.length) {
      blockedDates.splice(blockIndex, 1);
    } else {
      return NextResponse.json(
        { message: 'Invalid block index' },
        { status: 400 }
      );
    }
    
    // Update listing
    await pool.query(
      `UPDATE listings 
       SET blocked_dates = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [JSON.stringify(blockedDates), id]
    );
    
    return NextResponse.json({
      message: 'Blocked dates removed successfully',
      blockedDates: blockedDates,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}