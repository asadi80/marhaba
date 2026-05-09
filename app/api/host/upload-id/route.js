import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { idVerificationUrl, publicId } = await request.json();
    if (!idVerificationUrl) {
      return NextResponse.json({ message: 'Missing URL' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    if (user.role !== 'host') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    // idImages is the correct field from your User model
    user.idImages = [...(user.idImages || []), idVerificationUrl];
    await user.save();

    return NextResponse.json({ success: true, totalImages: user.idImages.length });
  } catch (error) {
    console.error('save-id-url error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}