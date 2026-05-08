// app/api/cron/check-expired-users/route.js
import { NextResponse } from "next/server";
import {connectToDatabase} from "@/lib/mongodb";
import User from "@/models/User";
import Listing from "@/models/Listing";

export async function GET(request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    await connectToDatabase();
    
    const today = new Date();
    const results = {
      expiredHosts: [],
      expiringHosts7Days: [],
      expiringHosts2Days: [],
      suspendedUsers: [],
    };
    
    // 1. Check ALL hosts (confirmed and pending)
    const hosts = await User.find({
      role: "host",
    });
    
    for (const host of hosts) {
      // Handle expired subscriptions
      if (host.status === "confirmed" && host.hostExpiryDate) {
        const expiryDate = new Date(host.hostExpiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        // Expired - change to pending
        if (expiryDate <= today) {
          host.status = "pending";
          host.statusReason = "expired";
          
          // Deactivate all listings
          await Listing.updateMany(
            { host: host._id },
            { isActive: false, status: "inactive" }
          );
          
          results.expiredHosts.push({
            id: host._id,
            email: host.email,
            name: host.name,
            expiryDate: host.hostExpiryDate,
          });
          
          await host.save();
        }
        // 2 days warning
        else if (daysUntilExpiry <= 2 && daysUntilExpiry > 0) {
          if (!host.hostDetails?.notificationSent?.twoDays) {
            results.expiringHosts2Days.push({
              id: host._id,
              email: host.email,
              name: host.name,
              daysLeft: daysUntilExpiry,
              expiryDate: host.hostExpiryDate,
            });
            
            if (!host.hostDetails) host.hostDetails = {};
            host.hostDetails.notificationSent = {
              ...host.hostDetails.notificationSent,
              twoDays: true,
            };
            await host.save();
          }
        }
        // 7 days warning
        else if (daysUntilExpiry <= 7 && daysUntilExpiry > 2) {
          if (!host.hostDetails?.notificationSent?.oneWeek) {
            results.expiringHosts7Days.push({
              id: host._id,
              email: host.email,
              name: host.name,
              daysLeft: daysUntilExpiry,
              expiryDate: host.hostExpiryDate,
            });
            
            if (!host.hostDetails) host.hostDetails = {};
            host.hostDetails.notificationSent = {
              ...host.hostDetails.notificationSent,
              oneWeek: true,
            };
            await host.save();
          }
        }
      }
    }
    
    // 2. Check for users that should be suspended (inactive for 1 year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const inactiveUsers = await User.find({
      role: "user",
      status: "confirmed",
      lastActive: { $lt: oneYearAgo }
    });
    
    for (const user of inactiveUsers) {
      user.status = "suspended";
      user.statusReason = "inactive";
      results.suspendedUsers.push({
        id: user._id,
        email: user.email,
        name: user.name,
        lastActive: user.lastActive,
      });
      await user.save();
    }
    
    // Log results for monitoring
    console.log(`[${new Date().toISOString()}] Expiry check completed:`, {
      expiredHosts: results.expiredHosts.length,
      expiringHosts7Days: results.expiringHosts7Days.length,
      expiringHosts2Days: results.expiringHosts2Days.length,
      suspendedUsers: results.suspendedUsers.length,
    });
    
    return NextResponse.json({
      success: true,
      message: "Expiry check completed successfully",
      timestamp: new Date().toISOString(),
      results,
    });
    
  } catch (error) {
    console.error("Error checking expired users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}