// app/api/admin/seed/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    // Get secret key from request body
    const { secretKey } = await request.json();
    
    // Check if secret key matches
    const expectedSecret = process.env.ADMIN_SEED_SECRET;
    
    if (!expectedSecret) {
      console.error("ADMIN_SEED_SECRET not set in environment variables");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }
    
    if (secretKey !== expectedSecret) {
      return NextResponse.json(
        { message: "Invalid secret key" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ 
      role: "super_admin" 
    });

    if (existingAdmin) {
      return NextResponse.json(
        { 
          message: "Super admin already exists",
          admin: {
            name: existingAdmin.name,
            email: existingAdmin.email,
            role: existingAdmin.role
          }
        },
        { status: 400 }
      );
    }

    // Create super admin
    const hashedPassword = await bcrypt.hash("Abdo172*)", 10);
    
    const admin = await User.create({
      name: "Abdurraouf Sadi",
      email: "abdurraouf@mar-haba.ly",
      password: hashedPassword,
      phoneNumber: "+19714924946",
      role: "super_admin",
      status: "confirmed",
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      userDetails: {
        bookings: [],
        preferences: {},
        memberSince: new Date(),
      },
    });

    // Return success response WITHOUT exposing the password
    return NextResponse.json({
      success: true,
      message: "Super admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
      // REMOVED: credentials object that exposed the password
      // Admin should use a secure method to set/reset password if needed
    }, { status: 201 });

  } catch (error) {
    console.error("Seed admin error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// Optional: GET method to check if admin exists
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get("secretKey");
    const expectedSecret = process.env.ADMIN_SEED_SECRET;
    
    if (secretKey !== expectedSecret) {
      return NextResponse.json(
        { message: "Invalid secret key" },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const admin = await User.findOne({ 
      role: "super_admin" 
    }).select("-password");
    
    if (admin) {
      return NextResponse.json({
        exists: true,
        admin: {
          name: admin.name,
          email: admin.email,
          role: admin.role,
          status: admin.status
        }
      });
    } else {
      return NextResponse.json({
        exists: false,
        message: "No super admin found. Run POST request to create one."
      });
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}