// app/api/auth/me/route.js - POSTGRESQL VERSION
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/postgres';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user - PostgreSQL version
    const result = await pool.query(
      `SELECT id, name, email, phone_number, role, status, created_at, 
              host_expiry_date, email_verified, id_images
       FROM users 
       WHERE id = $1`,
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phone_number,
        role: user.role,
        status: user.status,
        createdAt: user.created_at,
        hostExpiryDate: user.host_expiry_date,
        emailVerified: user.email_verified,
        hasIdImages: user.id_images && user.id_images.length > 0,
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
}