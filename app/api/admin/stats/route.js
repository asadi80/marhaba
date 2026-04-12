// app/api/admin/stats/route.js
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/middleware/adminAuth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Listing from '@/models/Listing';
import Booking from '@/models/Booking';

export async function GET(request) {
  try {
    const auth = await verifyAdmin(request, 'admin');
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }
    
    await connectToDatabase();
    
    // Get counts
    const [
      totalUsers,
      totalHosts,
      totalAdmins,
      totalSuperAdmins,
      totalListings,
      totalBookings,
      pendingHosts,
      confirmedBookings,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'host' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'super_admin' }),
      Listing.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments({ role: 'host', status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
    ]);
    
    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('listing', 'title')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Calculate total revenue
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    const totalRevenue = revenueResult[0]?.total || 0;
    
    // Get recent users
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);
    
    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalHosts,
        totalAdmins,
        totalSuperAdmins,
        totalListings,
        totalBookings,
        pendingHosts,
        confirmedBookings,
        totalRevenue,
        recentBookings,
        recentUsers,
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}