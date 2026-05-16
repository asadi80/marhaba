// app/api/admin/users/[id]/route.js - POSTGRESQL VERSION
import { NextResponse } from "next/server";
import pool from "@/lib/postgres";
import { verifyAdminFromCookie } from "@/lib/adminAuth";
import { sendEmail } from "@/lib/sendEmail";

// Helper function to format date for email
function formatDateForEmail(date) {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
}

// Helper function to get user by ID
async function getUserById(userId) {
  const result = await pool.query(
    `SELECT id, name, email, phone_number, role, status, status_reason, 
            host_expiry_date, email_verified, created_at, host_details, user_details, id_images
     FROM users 
     WHERE id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

// Get single user
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Verify admin using cookie
    const auth = await verifyAdminFromCookie(request, "admin");
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status },
      );
    }

    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Format response
    const formattedUser = {
      _id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone_number,
      role: user.role,
      status: user.status,
      statusReason: user.status_reason,
      hostExpiryDate: user.host_expiry_date,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      hostDetails: user.host_details,
      userDetails: user.user_details,
      idImages: user.id_images || []
    };

    return NextResponse.json({ success: true, user: formattedUser });
  } catch (error) {
    console.error("GET user error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Update user
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
    // Verify admin using cookie
    const auth = await verifyAdminFromCookie(request, "admin");
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status },
      );
    }

    const body = await request.json();
    const { name, email, phoneNumber, role, status, statusReason } = body;

    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check permissions for modifying roles
    if (auth.user.role === "admin") {
      // Admin cannot modify other admins or super admins
      if (user.role === "admin" || user.role === "super_admin") {
        return NextResponse.json(
          { message: "Admins cannot modify other admin users" },
          { status: 403 },
        );
      }
      // Admin cannot change role to admin or super_admin
      if (role && (role === "admin" || role === "super_admin")) {
        return NextResponse.json(
          { message: "Admins cannot promote users to admin roles" },
          { status: 403 },
        );
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(name);
    }
    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(email);
    }
    if (phoneNumber !== undefined) {
      updateFields.push(`phone_number = $${paramIndex++}`);
      updateValues.push(phoneNumber);
    }

    // Track changes for notifications
    let wasHostJustConfirmed = false;
    let wasHostJustSuspended = false;
    let newExpiryDate = null;
    let previousStatus = user.status;
    let previousRole = user.role;

    // Update role (only super_admin)
    if (role && auth.user.role === "super_admin") {
      updateFields.push(`role = $${paramIndex++}`);
      updateValues.push(role);
    }

    // Handle status update
    if (status && auth.user.role === 'super_admin') {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(status);
      updateFields.push(`status_reason = $${paramIndex++}`);
      updateValues.push(statusReason || null);

      // Host confirmed - set expiry date
      if (status === 'confirmed' && (user.role === 'host' || role === 'host')) {
        newExpiryDate = new Date();
        newExpiryDate.setMonth(newExpiryDate.getMonth() + 6);
        updateFields.push(`host_expiry_date = $${paramIndex++}`);
        updateValues.push(newExpiryDate);
        wasHostJustConfirmed = true;
      }

      // Manual pending
      if (status === 'pending') {
        updateFields.push(`status_reason = $${paramIndex - 1}`); // Use existing statusReason
      }

      // Suspended - clear expiry date
      if (status === 'suspended') {
        updateFields.push(`host_expiry_date = $${paramIndex++}`);
        updateValues.push(null);
        wasHostJustSuspended = true;
        
        // Suspend all user's listings
        await pool.query(
          `UPDATE listings SET status = 'suspended', updated_at = CURRENT_TIMESTAMP WHERE host_id = $1`,
          [id]
        );
        
        // Cancel all pending bookings for this user's listings
        const listingIdsResult = await pool.query(
          `SELECT id FROM listings WHERE host_id = $1`,
          [id]
        );
        const listingIds = listingIdsResult.rows.map(r => r.id);
        
        if (listingIds.length > 0) {
          await pool.query(
            `UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
             WHERE listing_id = ANY($1::UUID[]) AND status = 'pending'`,
            [listingIds]
          );
        }
        
        // Cancel all bookings made by this user
        await pool.query(
          `UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
           WHERE user_id = $1 AND status = 'pending'`,
          [id]
        );
      }
      
      // Reactivated from suspension - reactivate listings
      if (previousStatus === 'suspended' && status !== 'suspended') {
        await pool.query(
          `UPDATE listings SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE host_id = $1`,
          [id]
        );
      }
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updateFields.length > 1) { // More than just updated_at
      updateValues.push(id);
      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, name, email, role, status, host_expiry_date
      `;
      
      await pool.query(updateQuery, updateValues);
    }

    // Send email notification if host was just confirmed
    if (wasHostJustConfirmed && user.email) {
      try {
        const expiryDate = newExpiryDate || new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        
        const emailContent = getHostConfirmationEmailContent(
          { name: user.name, email: user.email }, 
          expiryDate, 
          daysUntilExpiry
        );
        
        await sendEmail({
          to: user.email,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        });
        console.log('Host confirmation email sent to:', user.email);
      } catch (emailError) {
        console.error('Failed to send host confirmation email:', emailError);
      }
    }

    // Send email notification if host was just suspended
    if (wasHostJustSuspended && user.email && (user.role === 'host' || role === 'host')) {
      try {
        const emailContent = getHostSuspensionEmailContent({ name: user.name, email: user.email });
        
        await sendEmail({
          to: user.email,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        });
        console.log('Host suspension email sent to:', user.email);
      } catch (emailError) {
        console.error('Failed to send host suspension email:', emailError);
      }
    }

    const updatedUser = await getUserById(id);
    delete updatedUser.password_hash;

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("PUT user error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Delete user - delete all listings and bookings
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Verify super_admin using cookie
    const auth = await verifyAdminFromCookie(request, "super_admin");
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status },
      );
    }

    if (!id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 },
      );
    }

    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent deleting yourself
    if (user.id === auth.user.id) {
      return NextResponse.json(
        { message: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    // Use a transaction to ensure all operations succeed or fail together
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Find all listings by this user
      const userListingsResult = await client.query(
        `SELECT id FROM listings WHERE host_id = $1`,
        [id]
      );
      const listingIds = userListingsResult.rows.map(row => row.id);
      
      // Delete all bookings for these listings
      if (listingIds.length > 0) {
        await client.query(
          `DELETE FROM bookings WHERE listing_id = ANY($1::UUID[])`,
          [listingIds]
        );
      }
      
      // Delete all bookings made by this user
      await client.query(
        `DELETE FROM bookings WHERE user_id = $1`,
        [id]
      );
      
      // Delete all listings by this user
      await client.query(
        `DELETE FROM listings WHERE host_id = $1`,
        [id]
      );
      
      // Finally delete the user
      await client.query(
        `DELETE FROM users WHERE id = $1`,
        [id]
      );
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        success: true,
        message: "User and all associated listings and bookings deleted successfully",
        deletedCount: {
          listings: listingIds.length,
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Bilingual email template for host confirmation
function getHostConfirmationEmailContent(host, expiryDate, daysUntilExpiry) {
  const formattedExpiryDate = formatDateForEmail(expiryDate);
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  return {
    subject: `Welcome as a Host! / مرحباً بك كمضيف! - Marhaba`,
    text: `English: Congratulations! Your host account has been confirmed. Your hosting status is valid for 6 months until ${formattedExpiryDate}. You can now start listing your properties and accepting bookings.\n\nالعربية: تهانينا! تم تأكيد حسابك كمضيف. صلاحية حساب المضيف صالحة لمدة 6 أشهر حتى ${formattedExpiryDate}. يمكنك الآن البدء في إضافة عقاراتك واستقبال الحجوزات.`,
    html: `
<div style="font-family: Arial, 'Cairo', 'Tajawal', sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f7f6f2;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #1a1a2e;">مر<span style="color: #e8c547;">حبا</span></h1>
  </div>
  <h2 style="color: #4F46E5;">🎉 Welcome as a Host!</h2>
  <p>Dear ${host.name},</p>
  <p><strong>Congratulations!</strong> Your host account has been <strong>confirmed</strong> by the Marhaba admin team.</p>
  <div style="background: #e0e7ff; padding: 20px; border-radius: 12px; margin: 20px 0;">
    <h3>✨ Host Account Details:</h3>
    <p><strong>📅 Expiry Date:</strong> ${formattedExpiryDate}</p>
    <p><strong>🔔 Days Remaining:</strong> ${daysUntilExpiry} days</p>
  </div>
  <a href="${appUrl}/host-dashboard" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
    Go to Host Dashboard →
  </a>
  <div style="border-top: 2px solid #e5e7eb; margin: 20px 0;"></div>
  <div style="direction: rtl; text-align: right;">
    <h2 style="color: #4F46E5;">🎉 مرحباً بك كمضيف!</h2>
    <p>عزيزي ${host.name}،</p>
    <p><strong>تهانينا!</strong> تم <strong>تأكيد</strong> حسابك كمضيف.</p>
    <div style="background: #e0e7ff; padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3>✨ تفاصيل حساب المضيف:</h3>
      <p><strong>📅 تاريخ الانتهاء:</strong> ${formattedExpiryDate}</p>
      <p><strong>🔔 الأيام المتبقية:</strong> ${daysUntilExpiry} يوم</p>
    </div>
    <a href="${appUrl}/host-dashboard" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
      الذهاب إلى لوحة التحكم ←
    </a>
  </div>
</div>
    `
  };
}

// Bilingual email template for host suspension
function getHostSuspensionEmailContent(host) {
  const supportEmail = "support@mar-haba.ly";
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  return {
    subject: `Important: Your Host Account Has Been Suspended / مهم: تم تعليق حساب المضيف الخاص بك - Marhaba`,
    text: `English: Your host account has been suspended. Please contact support at ${supportEmail} for more information.\n\nالعربية: تم تعليق حساب المضيف الخاص بك. يرجى الاتصال بالدعم على ${supportEmail} للمزيد من المعلومات.`,
    html: `
<div style="font-family: Arial, 'Cairo', 'Tajawal', sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f7f6f2;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #1a1a2e;">مر<span style="color: #e8c547;">حبا</span></h1>
  </div>
  <div style="background: #FCEBEB; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 20px;">
    <span style="color: #791F1F;">⚠️ ACCOUNT SUSPENDED</span>
  </div>
  <h2 style="color: #791F1F;">Account Suspension Notice</h2>
  <p>Dear ${host.name},</p>
  <p>Your <strong>host account has been suspended</strong>. Please contact support for assistance.</p>
  <a href="mailto:${supportEmail}" style="background-color: #1a1a2e; color: #e8c547; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
    Contact Support →
  </a>
  <div style="border-top: 2px solid #e5e7eb; margin: 20px 0;"></div>
  <div style="direction: rtl; text-align: right;">
    <div style="background: #FCEBEB; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 20px;">
      <span style="color: #791F1F;">⚠️ الحساب معلق</span>
    </div>
    <h2 style="color: #791F1F;">إشعار تعليق الحساب</h2>
    <p>عزيزي ${host.name}،</p>
    <p><strong>تم تعليق حساب المضيف الخاص بك</strong>. يرجى التواصل مع الدعم للمساعدة.</p>
    <a href="mailto:${supportEmail}" style="background-color: #1a1a2e; color: #e8c547; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
      اتصل بالدعم ←
    </a>
  </div>
</div>
    `
  };
}