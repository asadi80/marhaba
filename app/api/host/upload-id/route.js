// app/api/host/upload-id/route.js - POSTGRESQL VERSION
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/postgres';

export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Parse JSON body
    const body = await request.json();
    const { idVerificationUrl, publicId } = body;
    
    if (!idVerificationUrl) {
      return NextResponse.json({ message: 'Missing URL' }, { status: 400 });
    }

    // Get user and check role
    const userResult = await pool.query(
      `SELECT id, role, id_images FROM users WHERE id = $1`,
      [decoded.userId]
    );
    
    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    const user = userResult.rows[0];
    
    if (user.role !== 'host') {
      return NextResponse.json({ message: 'Forbidden - Only hosts can upload ID' }, { status: 403 });
    }

    // Get current id_images array or initialize empty array
    let currentImages = user.id_images || [];
    if (typeof currentImages === 'string') {
      try {
        currentImages = JSON.parse(currentImages);
      } catch {
        currentImages = [];
      }
    }
    
    // Add the new URL to the array
    const updatedImages = [...currentImages, idVerificationUrl];
    
    // Update user with new id_images array
    await pool.query(
      `UPDATE users 
       SET id_images = $1, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [updatedImages, decoded.userId]
    );

    return NextResponse.json({ 
      success: true, 
      totalImages: updatedImages.length,
      message: 'ID uploaded successfully'
    });
    
  } catch (error) {
    console.error('save-id-url error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
}