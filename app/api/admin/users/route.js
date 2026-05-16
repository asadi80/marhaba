// app/api/admin/users/route.js - POSTGRESQL VERSION
import { NextResponse } from 'next/server';
import pool from '@/lib/postgres';
import { verifyAdminFromCookie } from '@/lib/adminAuth';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  try {
    // Verify admin access
    const auth = await verifyAdminFromCookie(request, 'admin');
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    
    // Build WHERE clause
    let whereConditions = [];
    const queryParams = [];
    let paramIndex = 1;
    
    if (role && role !== 'all') {
      whereConditions.push(`role = $${paramIndex++}`);
      queryParams.push(role);
    }
    if (status && status !== 'all') {
      whereConditions.push(`status = $${paramIndex++}`);
      queryParams.push(status);
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    // Get users with pagination (exclude password_hash)
    const result = await pool.query(
      `SELECT id, name, email, phone_number, role, status, 
              email_verified, created_at, updated_at, host_expiry_date
       FROM users 
       ${whereClause}
       ORDER BY created_at DESC`,
      queryParams
    );
    
    const users = result.rows.map(user => ({
      _id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone_number,
      role: user.role,
      status: user.status,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      hostExpiryDate: user.host_expiry_date
    }));
    
    // Separate users by role for easier frontend display
    const usersByRole = {
      users: users.filter(u => u.role === 'user'),
      hosts: users.filter(u => u.role === 'host'),
      admins: users.filter(u => u.role === 'admin'),
      super_admins: users.filter(u => u.role === 'super_admin'),
    };
    
    return NextResponse.json({
      success: true,
      users,
      usersByRole,
      total: users.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// Create new admin (super_admin only)
export async function POST(request) {
  try {
    // Verify super admin access
    const auth = await verifyAdminFromCookie(request, 'super_admin');
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }
    
    const body = await request.json();
    const { name, email, password, phoneNumber, role } = body;
    
    // Validation
    if (!name || !email || !password || !phoneNumber) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }
    
    // Only allow creating admin or super_admin
    if (!['admin', 'super_admin'].includes(role)) {
      return NextResponse.json(
        { message: 'Can only create admin or super_admin users' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const existingUserResult = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );
    
    if (existingUserResult.rows.length > 0) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.query(
      `INSERT INTO users (
        name, email, password_hash, phone_number, role, status, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, phone_number, role, status, created_at`,
      [
        name,
        email,
        hashedPassword,
        phoneNumber,
        role,
        'confirmed', // Admins are automatically confirmed
        true // Admins are automatically email verified
      ]
    );
    
    const user = result.rows[0];
    
    const userResponse = {
      _id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone_number,
      role: user.role,
      status: user.status,
      createdAt: user.created_at
    };
    
    return NextResponse.json({
      success: true,
      message: `${role} created successfully`,
      user: userResponse,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}