// app/api/listings/nearby/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from '@/lib/mongodb';
import Listing from "@/models/Listing";

// Haversine formula to calculate distance between two coordinates (in km)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const radius = parseFloat(searchParams.get('radius')) || 50; // Default 50km radius
    const limit = parseInt(searchParams.get('limit')) || 20;
    const category = searchParams.get('category'); // Optional category filter
    
    // Validate coordinates
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid coordinates. Please provide valid lat and lng parameters." 
        },
        { status: 400 }
      );
    }
    
    // Build query - Only show listings that are:
    // 1. Have valid coordinates
    // 2. Are confirmed (host status)
    // 3. Are active (not suspended or deleted)
    let query = {
      coordinates: { $exists: true, $ne: null },
      status: { $in: ['active', 'confirmed'] }, // Include both 'active' and 'confirmed' for backward compatibility
      $or: [
        { status: 'active' },
        { status: 'confirmed' } // For older listings that might still use 'confirmed'
      ]
    };
    
    // Also need to join with User model to check host status
    // Since listing doesn't have direct status field, we need to populate host and check their status
    // Alternative approach: Add status field to listing model
    
    // Add category filter if provided
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Fetch listings and populate host to check host status
    const allListings = await Listing.find(query)
      .select('title description price location coordinates images category host createdAt')
      .populate('host', 'status role name') // Populate host to check their status
      .lean(); // Use lean() for better performance
    
    if (!allListings || allListings.length === 0) {
      return NextResponse.json({
        success: true,
        center: { lat, lng },
        radius,
        count: 0,
        listings: [],
        message: "No listings found in the specified area"
      });
    }
    
    // Filter listings by distance AND host status
    const nearbyListings = allListings
      .map(listing => {
        // Skip listings without valid coordinates
        if (!listing.coordinates || 
            !listing.coordinates.lat || 
            !listing.coordinates.lng) {
          return null;
        }
        
        // Skip listings whose host is suspended
        if (listing.host && listing.host.status === 'suspended') {
          return null;
        }
        
        // Skip if host is not a host role (shouldn't happen but safe check)
        if (listing.host && listing.host.role !== 'host') {
          return null;
        }
        
        const distance = getDistanceFromLatLonInKm(
          lat, lng,
          listing.coordinates.lat,
          listing.coordinates.lng
        );
        
        return {
          ...listing,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          hostName: listing.host?.name || 'Unknown Host',
          hostStatus: listing.host?.status
        };
      })
      .filter(listing => listing && listing.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
    
    return NextResponse.json({
      success: true,
      center: { lat, lng },
      radius,
      count: nearbyListings.length,
      listings: nearbyListings,
      filters: {
        category: category || 'all',
        limit
      }
    });
    
  } catch (error) {
    console.error('Nearby listings error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}