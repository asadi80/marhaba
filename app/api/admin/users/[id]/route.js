import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Listing from "@/models/Listing";
import Booking from "@/models/Booking";
import { verifyAdminFromCookie } from "@/lib/adminAuth";

// Get single user
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    
    // Verify admin using cookie
    const auth = await verifyAdminFromCookie(request, "admin");
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status },
      );
    }

    await connectToDatabase();

    const user = await User.findById(resolvedParams.id).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("GET user error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Update user
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    
    // Verify admin using cookie
    const auth = await verifyAdminFromCookie(request, "admin");
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status },
      );
    }

    const body = await request.json();
    const { name, email, phoneNumber, role, status } = body;

    await connectToDatabase();

    const user = await User.findById(resolvedParams.id);
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

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    // Update role (only super_admin)
    if (role && auth.user.role === "super_admin") {
      user.role = role;
    }

    // Track if host is being confirmed
    let wasHostJustConfirmed = false;
    let wasPreviouslyHost = user.role === "host";
    
    // Safe status handling
    if (status && auth.user.role === 'super_admin') {
      const previousStatus = user.status;
      user.status = status;

      // Host confirmed
      if (status === 'confirmed' && user.role === 'host') {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 6);
        user.hostExpiryDate = expiry;
        user.statusReason = null;
        wasHostJustConfirmed = true;
      }

      // Manual pending
      if (status === 'pending') {
        user.statusReason = 'manual_pending';
      }

      // Suspended - suspend all listings and bookings
      if (status === 'suspended') {
        user.hostExpiryDate = null;
        user.statusReason = 'admin_suspended';
        
        // Suspend all user's listings
        await Listing.updateMany(
          { host: user._id },
          { status: 'suspended' }
        );
        
        // Cancel all pending bookings for this user's listings
        await Booking.updateMany(
          { 
            listing: { $in: await Listing.find({ host: user._id }).distinct('_id') },
            status: 'pending'
          },
          { status: 'cancelled' }
        );
        
        // Cancel all bookings made by this user
        await Booking.updateMany(
          { user: user._id, status: 'pending' },
          { status: 'cancelled' }
        );
      }
      
      // Reactivated from suspension - reactivate listings
      if (previousStatus === 'suspended' && status !== 'suspended') {
        await Listing.updateMany(
          { host: user._id },
          { status: 'active' }
        );
      }
    }

    // Also check if user role is being changed to host and they are being confirmed
    if (role === 'host' && auth.user.role === "super_admin" && user.role !== 'host') {
      wasPreviouslyHost = false;
      // If setting to host and status is confirmed or will be confirmed
      if (status === 'confirmed' || user.status === 'confirmed') {
        wasHostJustConfirmed = true;
      }
    }

    await user.save();

    // Send email notification if host was just confirmed
    if (wasHostJustConfirmed && user.email) {
      try {
        const expiryDate = user.hostExpiryDate;
        const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        
        // Import sendEmail function
        const { sendEmail } = await import('@/lib/sendEmail');
        
        // Create bilingual email content
        const emailContent = getHostConfirmationEmailContent(user, expiryDate, daysUntilExpiry);
        
        await sendEmail({
          to: user.email,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        });
        console.log('Host confirmation email sent to:', user.email);
      } catch (emailError) {
        console.error('Failed to send host confirmation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("PUT user error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Helper function to format date for email
function formatDateForEmail(date) {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
}

// Bilingual email template for host confirmation
function getHostConfirmationEmailContent(host, expiryDate, daysUntilExpiry) {
  const formattedExpiryDate = formatDateForEmail(expiryDate);
  
  return {
    subject: `Welcome as a Host! / مرحباً بك كمضيف! - Marhaba`,
    text: `English: Congratulations! Your host account has been confirmed. Your hosting status is valid for 6 months until ${formattedExpiryDate}. You can now start listing your properties and accepting bookings.\n\nالعربية: تهانينا! تم تأكيد حسابك كمضيف. صلاحية حساب المضيف صالحة لمدة 6 أشهر حتى ${formattedExpiryDate}. يمكنك الآن البدء في إضافة عقاراتك واستقبال الحجوزات.`,
    html: `
<div style="font-family: Arial, 'Cairo', 'Tajawal', sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f7f6f2;">
  
  <!-- English Section -->
  <div style="margin-bottom: 30px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #1a1a2e; font-family: 'Cairo', serif;">مر<span style="color: #e8c547;">حبا</span></h1>
    </div>
    
    <h2 style="color: #4F46E5;">🎉 Welcome as a Host!</h2>
    
    <p>Dear ${host.name},</p>
    
    <p><strong>Congratulations!</strong> Your host account has been <strong>confirmed</strong> by the Marhaba admin team.</p>
    
    <div style="background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #4F46E5;">✨ Host Account Details:</h3>
      <p><strong>📅 Account Status:</strong> <span style="color: #22c55e; font-weight: bold;">Confirmed</span></p>
      <p><strong>⏰ Valid For:</strong> 6 months</p>
      <p><strong>📆 Expiry Date:</strong> ${formattedExpiryDate}</p>
      <p><strong>🔔 Days Remaining:</strong> ${daysUntilExpiry} days</p>
    </div>
    
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; color: #92400e;">
        <strong>📌 Important Note:</strong> Your hosting status is valid for 6 months. Before it expires, you will receive a notification to renew. You can renew by contacting the admin team.
      </p>
    </div>
    
    <div style="margin: 25px 0;">
      <h3>🏠 What you can do now:</h3>
      <ul style="padding-left: 20px;">
        <li>Create and list your properties</li>
        <li>Set your availability and pricing</li>
        <li>Receive and manage booking requests</li>
        <li>Connect with travelers from around the world</li>
      </ul>
    </div>
    
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/host/dashboard" 
       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
      Go to Host Dashboard →
    </a>
    
    <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
      If you have any questions, feel free to contact our support team.
    </p>
  </div>
  
  <div style="border-top: 2px solid #e5e7eb; margin: 20px 0;"></div>
  
  <!-- Arabic Section -->
  <div style="direction: rtl; text-align: right;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #1a1a2e; font-family: 'Cairo', serif;">مر<span style="color: #e8c547;">حبا</span></h1>
    </div>
    
    <h2 style="color: #4F46E5;">🎉 مرحباً بك كمضيف!</h2>
    
    <p>عزيزي ${host.name}،</p>
    
    <p><strong>تهانينا!</strong> تم <strong>تأكيد</strong> حسابك كمضيف من قبل فريق إدارة مرحبا.</p>
    
    <div style="background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #4F46E5;">✨ تفاصيل حساب المضيف:</h3>
      <p><strong>📅 حالة الحساب:</strong> <span style="color: #22c55e; font-weight: bold;">مؤكد</span></p>
      <p><strong>⏰ صالح لمدة:</strong> 6 أشهر</p>
      <p><strong>📆 تاريخ الانتهاء:</strong> ${formattedExpiryDate}</p>
      <p><strong>🔔 الأيام المتبقية:</strong> ${daysUntilExpiry} يوم</p>
    </div>
    
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #f59e0b;">
      <p style="margin: 0; color: #92400e;">
        <strong>📌 ملاحظة مهمة:</strong> صلاحية حساب المضيف صالحة لمدة 6 أشهر. قبل انتهاء الصلاحية، ستتلقى إشعاراً للتجديد. يمكنك التجديد عن طريق التواصل مع فريق الإدارة.
      </p>
    </div>
    
    <div style="margin: 25px 0;">
      <h3>🏠 ما يمكنك فعله الآن:</h3>
      <ul style="padding-right: 20px;">
        <li>إضافة عقاراتك ونشرها</li>
        <li>تحديد توفر العقار وأسعاره</li>
        <li>استقبال وإدارة طلبات الحجز</li>
        <li>التواصل مع المسافرين من جميع أنحاء العالم</li>
      </ul>
    </div>
    
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/host-dashboard" 
       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
      الذهاب إلى لوحة التحكم ←
    </a>
    
    <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
      إذا كان لديك أي أسئلة، فلا تتردد في الاتصال بفريق الدعم.
    </p>
  </div>
  
  <div style="border-top: 2px solid #e5e7eb; margin: 20px 0;"></div>
  <p style="color: #6b7280; font-size: 12px; text-align: center;">
    Thank you for hosting with Marhaba! / شكراً لاستضافتك مع مرحبا!
  </p>
</div>
    `
  };
}

// Delete user - delete all listings and bookings
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;

    // Verify super_admin using cookie
    const auth = await verifyAdminFromCookie(request, "super_admin");
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: auth.status },
      );
    }

    if (!resolvedParams?.id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(resolvedParams.id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent deleting yourself
    if (user._id.toString() === auth.user._id.toString()) {
      return NextResponse.json(
        { message: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    // Start a session for transaction to ensure all operations succeed or fail together
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find all listings by this user
      const userListings = await Listing.find({ host: user._id }).session(session);
      const listingIds = userListings.map(listing => listing._id);
      
      // Delete all bookings for these listings
      if (listingIds.length > 0) {
        await Booking.deleteMany(
          { listing: { $in: listingIds } },
          { session }
        );
      }
      
      // Delete all bookings made by this user
      await Booking.deleteMany(
        { user: user._id },
        { session }
      );
      
      // Delete all listings by this user
      await Listing.deleteMany(
        { host: user._id },
        { session }
      );
      
      // Finally delete the user
      await user.deleteOne({ session });
      
      // Commit the transaction
      await session.commitTransaction();
      
      return NextResponse.json({
        success: true,
        message: "User and all associated listings and bookings deleted successfully",
        deletedCount: {
          listings: listingIds.length,
          bookings: await Booking.countDocuments({ user: user._id })
        }
      });
    } catch (error) {
      // Rollback transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}