import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { name, email, password, phoneNumber, userType = 'user' } = await request.json();

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

    if (!['user', 'host'].includes(userType)) {
      return NextResponse.json(
        { message: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }
    
    /* 🔐 Hash password */
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role
    const userData = {
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: userType,
    };

    // Add role-specific data
    if (userType === 'host') {
      userData.hostDetails = {
        rating: 0,
        totalListings: 0,
        verified: false,
        joinedDate: new Date(),
      };
    } else {
      userData.userDetails = {
        bookings: [],
        preferences: {},
        memberSince: new Date(),
        status: "pending",
      };
    }

    // Create user
    const user = await User.create(userData);

    // Create MarhabaToken
    const marhabaToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        name: user.name,
        userType: user.role,
        tokenType: 'MarhabaToken'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare user response (without password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.role,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
    };

    // REMOVED cookie setting - now just return token in response body
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      marhabaToken,  // Send token in response body
      user: userResponse,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}