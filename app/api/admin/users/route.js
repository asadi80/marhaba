// app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAdminFromCookie } from '@/lib/adminAuth'; // Import from shared location


export async function GET(request) {
  try {
    // Verify admin access
    const auth = await  verifyAdminFromCookie(request, 'admin');
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }
    
    await connectToDatabase();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    
    // Build query
    let query = {};
    if (role && role !== 'all') {
      query.role = role;
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
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
    const auth = await verifyAdmin(request, 'super_admin');
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
    
    await connectToDatabase();
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      status: 'confirmed', // Admins are automatically confirmed
    });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
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