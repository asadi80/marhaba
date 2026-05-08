// app/api/seed/admin/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    // Optional: Add secret key for security
    const { secretKey } = await request.json();
    const expectedSecret = process.env.ADMIN_SEED_SECRET || "your-secret-key-change-this";
    
    if (secretKey !== expectedSecret) {
      return NextResponse.json(
        { message: "Unauthorized. Invalid secret key." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: "admin@marhaba.com" },
        { role: "super_admin" }
      ]
    });

    if (existingAdmin) {
      return NextResponse.json(
        { 
          message: "Admin already exists", 
          admin: {
            name: existingAdmin.name,
            email: existingAdmin.email,
            role: existingAdmin.role
          }
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("Admin@!@#$%^", 10);

    // Create super admin
    const admin = await User.create({
      name: "Super Admin",
      email: "admin@marhaba.com",
      password: hashedPassword,
      phoneNumber: "+1234567890",
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

    // Remove password from response
    const adminResponse = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      phoneNumber: admin.phoneNumber,
      status: admin.status,
      emailVerified: admin.emailVerified,
      createdAt: admin.createdAt,
    };

    return NextResponse.json({
      success: true,
      message: "Super admin created successfully",
      admin: adminResponse,
      credentials: {
        email: "admin@marhaba.com",
        password: "Admin@123456"
      }
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
    await connectToDatabase();
    
    const admin = await User.findOne({ 
      role: { $in: ["admin", "super_admin"] }
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
        message: "No admin found. Run POST request to create one."
      });
    }
  } catch (error) {
    console.error("Check admin error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}