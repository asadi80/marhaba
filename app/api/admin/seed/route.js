// app/api/admin/seed/route.js - POSTGRESQL VERSION
import { NextResponse } from "next/server";
import pool from "@/lib/postgres";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    // Get secret key from request body
    const { secretKey } = await request.json();
    
    // Check if secret key matches
    const expectedSecret = process.env.ADMIN_SEED_SECRET;
    const adminPassword = process.env.ADMIN_SEED_PASS
    
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

    // Check if super admin already exists
    const existingAdminResult = await pool.query(
      `SELECT id, name, email, role, status FROM users WHERE role = 'super_admin' LIMIT 1`
    );

    if (existingAdminResult.rows.length > 0) {
      const existingAdmin = existingAdminResult.rows[0];
      return NextResponse.json(
        { 
          message: "Super admin already exists",
          admin: {
            name: existingAdmin.name,
            email: existingAdmin.email,
            role: existingAdmin.role,
            status: existingAdmin.status
          }
        },
        { status: 400 }
      );
    }

    // Create super admin
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Create user details object
    const userDetails = {
      bookings: [],
      preferences: {},
      memberSince: new Date()
    };
    
    const result = await pool.query(
      `INSERT INTO users (
        name, email, password_hash, phone_number, role, status, 
        email_verified, user_details, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING id, name, email, role, status, created_at`,
      [
        "Abdurraouf Sadi",
        "abdurraouf@mar-haba.ly",
        hashedPassword,
        "+19714924946",
        "super_admin",
        "confirmed",
        true,
        userDetails
      ]
    );
    
    const admin = result.rows[0];

    // Return success response WITHOUT exposing the password
    return NextResponse.json({
      success: true,
      message: "Super admin created successfully",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
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
    
    const result = await pool.query(
      `SELECT name, email, role, status FROM users WHERE role = 'super_admin' LIMIT 1`
    );
    
    if (result.rows.length > 0) {
      const admin = result.rows[0];
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
    console.error("Check admin error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}