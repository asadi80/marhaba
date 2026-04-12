// app/api/auth/me/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request) {
  console.log("me");
  
  try {
    // Get token from Authorization header (not cookies)
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 },
      );
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Connect to database
      await connectToDatabase();

      // Find user by id
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          hostExpiryDate: user.hostExpiryDate,
          createdAt: user.createdAt,
          ...(user.role === "host" && { hostDetails: user.hostDetails }),
          ...(user.role === "user" && { userDetails: user.userDetails }),
        },
      });
    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}