// app/api/listings/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/postgres";

// GET - Fetch all listings (for users)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    let whereConditions = `
      l.status = 'active'
      AND l.is_active = TRUE
      AND u.status = 'confirmed'
      AND u.role = 'host'
    `;

    const queryParams = [];
    let paramIndex = 1;

    if (location) {
      whereConditions += ` AND l.location ILIKE $${paramIndex}`;
      queryParams.push(`%${location}%`);
      paramIndex++;
    }

    if (minPrice || maxPrice) {
      if (minPrice && maxPrice) {
        whereConditions += ` AND l.price BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        queryParams.push(parseInt(minPrice), parseInt(maxPrice));
        paramIndex += 2;
      } else if (minPrice) {
        whereConditions += ` AND l.price >= $${paramIndex}`;
        queryParams.push(parseInt(minPrice));
        paramIndex++;
      } else if (maxPrice) {
        whereConditions += ` AND l.price <= $${paramIndex}`;
        queryParams.push(parseInt(maxPrice));
        paramIndex++;
      }
    }

    const result = await pool.query(
      `SELECT 
        l.id,
        l.title,
        l.description,
        l.price,
        l.location,
        l.latitude,
        l.longitude,
        l.images,
        l.category,
        l.amenities,
        l.rules,
        l.cancellation_policy,
        l.is_active,
        l.created_at,
        l.updated_at,
        u.id as host_id,
        u.name as host_name,
        u.email as host_email,
        u.status as host_status
       FROM listings l
       JOIN users u ON l.host_id = u.id
       WHERE ${whereConditions}
       ORDER BY l.created_at DESC`,
      queryParams,
    );

    const listings = result.rows.map((listing) => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      coordinates: {
        lat: listing.latitude,
        lng: listing.longitude,
      },
      images: listing.images || [],
      category: listing.category,
      amenities: listing.amenities || [],
      rules: listing.rules || [],
      cancellation_policy: listing.cancellation_policy || null,
      is_active: listing.is_active,
      createdAt: listing.created_at,
      updatedAt: listing.updated_at,
      host: {
        id: listing.host_id,
        name: listing.host_name,
        email: listing.host_email,
        status: listing.host_status,
      },
    }));

    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Fetch listings error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}

// POST - Create new listing (host only)
export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userResult = await pool.query(
      `SELECT id, role, status, host_details FROM users WHERE id = $1`,
      [decoded.userId],
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = userResult.rows[0];

    if (user.role !== "host") {
      return NextResponse.json(
        { message: "Only hosts can create listings" },
        { status: 403 },
      );
    }

    if (user.status === "suspended") {
      return NextResponse.json(
        { message: "Your account is suspended. You cannot create listings." },
        { status: 403 },
      );
    }

    if (user.status !== "confirmed") {
      return NextResponse.json(
        {
          message:
            "Your host account is not confirmed yet. Please wait for admin approval.",
        },
        { status: 403 },
      );
    }

    const {
      title,
      description,
      price,
      location,
      coordinates,
      images,
      amenities,
      rules,
      category,
      cancellation_policy,
    } = await request.json();

    // Validation
    if (!title || !description || !price || !location || !coordinates) {
      return NextResponse.json(
        { message: "All required fields must be filled" },
        { status: 400 },
      );
    }

    if (!coordinates.lat || !coordinates.lng) {
      return NextResponse.json(
        { message: "Valid coordinates are required" },
        { status: 400 },
      );
    }

    if (!images || images.length === 0 || !images[0]) {
      return NextResponse.json(
        { message: "At least one image is required" },
        { status: 400 },
      );
    }

    const filteredImages = images.filter((img) => img && img.trim() !== "");

    // ── FIX: all 13 params now correctly numbered ──
    const result = await pool.query(
      `INSERT INTO listings (
        title, description, price, location,
        latitude, longitude, images, amenities,
        rules, category, cancellation_policy, host_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active')
      RETURNING *`,
      [
        title,
        description,
        parseFloat(price),
        location,
        parseFloat(coordinates.lat),
        parseFloat(coordinates.lng),
        filteredImages,
        amenities || [],
        rules || [],
        category || "city",
        cancellation_policy ? JSON.stringify(cancellation_policy) : null, // $11
        user.id,                                                           // $12
      ],
    );

    const newListing = result.rows[0];

    // Update host's total listings count
    let hostDetails = user.host_details || {};
    if (typeof hostDetails === "string") {
      hostDetails = JSON.parse(hostDetails);
    }
    hostDetails.totalListings = (hostDetails.totalListings || 0) + 1;
    await pool.query(`UPDATE users SET host_details = $1 WHERE id = $2`, [
      hostDetails,
      user.id,
    ]);

    return NextResponse.json(
      {
        message: "Listing created successfully",
        listing: {
          id: newListing.id,
          title: newListing.title,
          description: newListing.description,
          price: newListing.price,
          location: newListing.location,
          coordinates: {
            lat: newListing.latitude,
            lng: newListing.longitude,
          },
          images: newListing.images,
          category: newListing.category,
          amenities: newListing.amenities,
          rules: newListing.rules,
          cancellation_policy: newListing.cancellation_policy,
          status: newListing.status,
          createdAt: newListing.created_at,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create listing error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update listing (host only)
export async function PUT(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userResult = await pool.query(
      `SELECT id, role, status FROM users WHERE id = $1`,
      [decoded.userId],
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = userResult.rows[0];

    if (user.role !== "host") {
      return NextResponse.json(
        { message: "Only hosts can update listings" },
        { status: 403 },
      );
    }

    if (user.status === "suspended") {
      return NextResponse.json(
        { message: "Your account is suspended. You cannot update listings." },
        { status: 403 },
      );
    }

    const { listingId, ...updateData } = await request.json();

    if (!listingId) {
      return NextResponse.json(
        { message: "Listing ID is required" },
        { status: 400 },
      );
    }

    const listingResult = await pool.query(
      `SELECT id, host_id, status FROM listings WHERE id = $1`,
      [listingId],
    );

    if (listingResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Listing not found" },
        { status: 404 },
      );
    }

    const listing = listingResult.rows[0];

    if (listing.host_id !== user.id) {
      return NextResponse.json(
        { message: "You can only update your own listings" },
        { status: 403 },
      );
    }

    if (listing.status === "deleted") {
      return NextResponse.json(
        { message: "Cannot update a deleted listing" },
        { status: 403 },
      );
    }

    // Build dynamic update query
    const updateFields = [];
    const updateParams = [];
    let paramIndex = 1;

    if (updateData.title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      updateParams.push(updateData.title);
    }
    if (updateData.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateParams.push(updateData.description);
    }
    if (updateData.price !== undefined) {
      updateFields.push(`price = $${paramIndex++}`);
      updateParams.push(parseFloat(updateData.price));
    }
    if (updateData.location !== undefined) {
      updateFields.push(`location = $${paramIndex++}`);
      updateParams.push(updateData.location);
    }
    if (updateData.coordinates) {
      if (updateData.coordinates.lat !== undefined) {
        updateFields.push(`latitude = $${paramIndex++}`);
        updateParams.push(updateData.coordinates.lat);
      }
      if (updateData.coordinates.lng !== undefined) {
        updateFields.push(`longitude = $${paramIndex++}`);
        updateParams.push(updateData.coordinates.lng);
      }
    }
    if (updateData.images !== undefined) {
      updateFields.push(`images = $${paramIndex++}`);
      updateParams.push(updateData.images);
    }
    if (updateData.amenities !== undefined) {
      updateFields.push(`amenities = $${paramIndex++}`);
      updateParams.push(updateData.amenities);
    }
    if (updateData.rules !== undefined) {
      updateFields.push(`rules = $${paramIndex++}`);
      updateParams.push(updateData.rules);
    }
    if (updateData.category !== undefined) {
      updateFields.push(`category = $${paramIndex++}`);
      updateParams.push(updateData.category);
    }
    // ── FIX: cancellation_policy now included in updates ──
    if (updateData.cancellation_policy !== undefined) {
      updateFields.push(`cancellation_policy = $${paramIndex++}`);
      updateParams.push(
        updateData.cancellation_policy
          ? JSON.stringify(updateData.cancellation_policy)
          : null,
      );
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateParams.push(listingId);

    const updateQuery = `
      UPDATE listings 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateParams);
    const updatedListing = result.rows[0];

    return NextResponse.json({
      message: "Listing updated successfully",
      listing: updatedListing,
    });
  } catch (error) {
    console.error("Update listing error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Soft delete listing (host only)
export async function DELETE(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userResult = await pool.query(
      `SELECT id, role, status, host_details FROM users WHERE id = $1`,
      [decoded.userId],
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = userResult.rows[0];

    if (user.role !== "host") {
      return NextResponse.json(
        { message: "Only hosts can delete listings" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("id");

    if (!listingId) {
      return NextResponse.json(
        { message: "Listing ID is required" },
        { status: 400 },
      );
    }

    const listingResult = await pool.query(
      `SELECT id, host_id FROM listings WHERE id = $1`,
      [listingId],
    );

    if (listingResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Listing not found" },
        { status: 404 },
      );
    }

    const listing = listingResult.rows[0];

    if (listing.host_id !== user.id) {
      return NextResponse.json(
        { message: "You can only delete your own listings" },
        { status: 403 },
      );
    }

    await pool.query(
      `UPDATE listings SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [listingId],
    );

    // Update host's total listings count
    let hostDetails = user.host_details || {};
    if (typeof hostDetails === "string") {
      hostDetails = JSON.parse(hostDetails);
    }
    if (hostDetails.totalListings && hostDetails.totalListings > 0) {
      hostDetails.totalListings -= 1;
      await pool.query(`UPDATE users SET host_details = $1 WHERE id = $2`, [
        hostDetails,
        user.id,
      ]);
    }

    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Delete listing error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}