import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import Listing from '@/models/Listing';
import User from '@/models/User';

export async function GET(request) {
  try {
    const token = request.cookies.get('MarhabaToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectToDatabase();
    
    const user = await User.findById(decoded.userId);
    
    if (user.role !== 'host') {
      return NextResponse.json(
        { message: 'Only hosts can access this endpoint' },
        { status: 403 }
      );
    }
    
    const listings = await Listing.find({ host: user._id })
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Fetch host listings error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}