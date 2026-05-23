// app/api/upload/sign-upload/route.js
import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    jwt.verify(token, process.env.JWT_SECRET);

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'marhaba-hostId' || 'marhaba-listings';
    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      timestamp,
      signature,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch {
    return NextResponse.json({ message: 'Failed to sign upload' }, { status: 500 });
  }
}