// app/api/listings/nearby/route.js
import { NextResponse } from "next/server";
import {connectToDatabase} from '@/lib/mongodb';
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
    
    // Validate coordinates
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Invalid coordinates. Please provide lat and lng parameters." },
        { status: 400 }
      );
    }
    
    // Fetch all listings with coordinates
    const allListings = await Listing.find({
      coordinates: { $exists: true, $ne: null }
    })
    
    // Filter listings by distance
    const nearbyListings = allListings
      .map(listing => {
        const distance = getDistanceFromLatLonInKm(
          lat, lng,
          listing.coordinates.lat,
          listing.coordinates.lng
        );
        return {
          ...listing.toObject(),
          distance: Math.round(distance * 10) / 10 // Round to 1 decimal
        };
      })
      .filter(listing => listing.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
    
    return NextResponse.json({
      success: true,
      center: { lat, lng },
      radius,
      count: nearbyListings.length,
      listings: nearbyListings
    });
    
  } catch (error) {
    console.error('Nearby listings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}