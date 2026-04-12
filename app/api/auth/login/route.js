// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { checkHostExpiry } from "@/lib/checkHostExpiry";
import User from '@/models/User';
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    console.log('Login attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    console.log('Database connected');

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return NextResponse.json(
        { message: 'User with this Email not found' },
        { status: 401 }
      );
    }
   
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const expiryResult = await checkHostExpiry(user);

    // Create MarhabaToken
    const marhabaToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        name: user.name,
        userType: user.role,
        role: user.role,
        tokenType: 'MarhabaToken'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // REMOVED cookie setting - now just return token in response body
    console.log('Login successful for:', email);
    
    return NextResponse.json({
      success: true,
      message: expiryResult.message || "Login successful",
      statusUpdated: expiryResult.updated || false,
      marhabaToken,  // Send token in response body
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.role,
        role: user.role,
        status: user.status,
      },
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}