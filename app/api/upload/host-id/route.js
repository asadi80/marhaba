// Enhanced version with more options
import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';


export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'marhaba-hostId';
    const resourceType = formData.get('resource_type') || 'auto';
    
    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'image/heic', 'image/heif'];
   if (!validTypes.includes(file.type)) {
  const name = file.name?.toLowerCase() ?? '';
  const allowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.pdf'];
  if (!allowedExt.some(ext => name.endsWith(ext))) {
    return NextResponse.json(
      { message: 'Invalid file type. Use JPG, PNG, or PDF.' },
      { status: 400 }
    );
  }
}

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File too large. Max 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with optional transformations
    const result = await new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: folder,
        resource_type: resourceType,
      };
      
      // Add image transformations for images
      if (file.type.startsWith('image/')) {
        uploadOptions.transformation = [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ];
      }
      
      cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Upload failed', error: error.message },
      { status: 500 }
    );
  }
}