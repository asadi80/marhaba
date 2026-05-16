// app/api/listings/nearby/route.js - FIXED VERSION
import { NextResponse } from "next/server";
import pool from '@/lib/postgres';

// Haversine formula to calculate distance between two coordinates (in km)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const radius = parseFloat(searchParams.get('radius')) || 50;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const category = searchParams.get('category');
    
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { success: false, error: "Invalid coordinates" },
        { status: 400 }
      );
    }
    
    // Build WHERE clause
    let whereConditions = `
      l.status = 'active'
      AND l.latitude IS NOT NULL 
      AND l.longitude IS NOT NULL
      AND u.status = 'confirmed'
      AND u.role = 'host'
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    if (category && category !== 'all') {
      whereConditions += ` AND l.category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }
    
    // Simple Haversine-based query (works without PostGIS)
    // Calculate bounding box for performance
    const degreesPerKm = 0.009;
    const latDelta = radius * degreesPerKm;
    const lngDelta = radius * degreesPerKm / Math.cos(lat * Math.PI / 180);
    
    const bboxQuery = `
      SELECT 
        l.id,
        l.title,
        l.description,
        l.price,
        l.location,
        l.latitude,
        l.longitude,
        l.images,
        l.category,
        l.amenities,
        l.created_at,
        u.name as host_name,
        u.status as host_status
      FROM listings l
      JOIN users u ON l.host_id = u.id
      WHERE ${whereConditions}
        AND l.latitude BETWEEN $${paramIndex}::float - $${paramIndex + 2}::float 
                          AND $${paramIndex}::float + $${paramIndex + 2}::float
        AND l.longitude BETWEEN $${paramIndex + 1}::float - $${paramIndex + 3}::float 
                           AND $${paramIndex + 1}::float + $${paramIndex + 3}::float
    `;
    
    const bboxParams = [lat, lng, latDelta, lngDelta];
    queryParams.push(...bboxParams);
    
    const result = await pool.query(bboxQuery, queryParams);
    
    // Calculate exact distances using Haversine and filter
    let listings = result.rows
      .map(listing => {
        const distance = getDistanceFromLatLonInKm(
          lat, lng,
          parseFloat(listing.latitude),
          parseFloat(listing.longitude)
        );
        
        return {
          ...listing,
          distance_km: Math.round(distance * 10) / 10
        };
      })
      .filter(listing => listing.distance_km <= radius)
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, limit);
    
    // Format response
    const formattedListings = listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      coordinates: {
        lat: parseFloat(listing.latitude),
        lng: parseFloat(listing.longitude)
      },
      images: listing.images || [],
      category: listing.category,
      amenities: listing.amenities || [],
      createdAt: listing.created_at,
      hostName: listing.host_name,
      hostStatus: listing.host_status,
      distance: listing.distance_km
    }));
    
    return NextResponse.json({
      success: true,
      center: { lat, lng },
      radius,
      count: formattedListings.length,
      listings: formattedListings,
      filters: {
        category: category || 'all',
        limit
      }
    });
    
  } catch (error) {
    console.error('Nearby listings error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}