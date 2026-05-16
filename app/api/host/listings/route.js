// app/api/host/listings/route.js - POSTGRESQL VERSION
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/postgres';

export async function GET(request) {
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
    const userResult = await pool.query(
      `SELECT id, role FROM users WHERE id = $1`,
      [decoded.userId]
    );
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    const user = userResult.rows[0];
    
    if (user.role !== 'host') {
      return NextResponse.json(
        { message: 'Only hosts can access this endpoint' },
        { status: 403 }
      );
    }
    
    // Get host's listings
    const listingsResult = await pool.query(
      `SELECT * FROM listings 
       WHERE host_id = $1 
       ORDER BY created_at DESC`,
      [user.id]
    );
    
    return NextResponse.json({ listings: listingsResult.rows });
  } catch (error) {
    console.error('Fetch host listings error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}