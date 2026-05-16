// app/api/cron/check-expired-users/route.js - POSTGRESQL VERSION
import { NextResponse } from "next/server";
import pool from "@/lib/postgres";

export async function GET(request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const today = new Date();
    const results = {
      expiredHosts: [],
      expiringHosts7Days: [],
      expiringHosts2Days: [],
      suspendedUsers: [],
    };
    
    // 1. Get all hosts
    const hostsResult = await pool.query(
      `SELECT id, email, name, status, host_expiry_date, host_details, status_reason 
       FROM users 
       WHERE role = 'host'`
    );
    
    const hosts = hostsResult.rows;
    
    for (const host of hosts) {
      // Handle expired subscriptions
      if (host.status === "confirmed" && host.host_expiry_date) {
        const expiryDate = new Date(host.host_expiry_date);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        // Parse host_details JSONB
        let hostDetails = host.host_details || {};
        if (typeof hostDetails === 'string') {
          hostDetails = JSON.parse(hostDetails);
        }
        
        // Expired - change to pending
        if (expiryDate <= today) {
          // Update user status
          await pool.query(
            `UPDATE users 
             SET status = 'pending', 
                 status_reason = 'expired',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [host.id]
          );
          
          // Deactivate all listings
          await pool.query(
            `UPDATE listings 
             SET status = 'inactive', 
                 updated_at = CURRENT_TIMESTAMP
             WHERE host_id = $1`,
            [host.id]
          );
          
          results.expiredHosts.push({
            id: host.id,
            email: host.email,
            name: host.name,
            expiryDate: host.host_expiry_date,
          });
        }
        // 2 days warning
        else if (daysUntilExpiry <= 2 && daysUntilExpiry > 0) {
          const notificationSent = hostDetails.notificationSent || {};
          
          if (!notificationSent.twoDays) {
            results.expiringHosts2Days.push({
              id: host.id,
              email: host.email,
              name: host.name,
              daysLeft: daysUntilExpiry,
              expiryDate: host.host_expiry_date,
            });
            
            // Update notification flag
            const updatedDetails = {
              ...hostDetails,
              notificationSent: {
                ...notificationSent,
                twoDays: true,
              }
            };
            
            await pool.query(
              `UPDATE users 
               SET host_details = $1, 
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = $2`,
              [updatedDetails, host.id]
            );
          }
        }
        // 7 days warning
        else if (daysUntilExpiry <= 7 && daysUntilExpiry > 2) {
          const notificationSent = hostDetails.notificationSent || {};
          
          if (!notificationSent.oneWeek) {
            results.expiringHosts7Days.push({
              id: host.id,
              email: host.email,
              name: host.name,
              daysLeft: daysUntilExpiry,
              expiryDate: host.host_expiry_date,
            });
            
            // Update notification flag
            const updatedDetails = {
              ...hostDetails,
              notificationSent: {
                ...notificationSent,
                oneWeek: true,
              }
            };
            
            await pool.query(
              `UPDATE users 
               SET host_details = $1, 
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = $2`,
              [updatedDetails, host.id]
            );
          }
        }
      }
    }
    
    // 2. Check for users that should be suspended (inactive for 1 year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const inactiveUsersResult = await pool.query(
      `SELECT id, email, name, last_active 
       FROM users 
       WHERE role = 'user' 
         AND status = 'confirmed' 
         AND last_active < $1`,
      [oneYearAgo]
    );
    
    const inactiveUsers = inactiveUsersResult.rows;
    
    for (const user of inactiveUsers) {
      await pool.query(
        `UPDATE users 
         SET status = 'suspended', 
             status_reason = 'inactive',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [user.id]
      );
      
      results.suspendedUsers.push({
        id: user.id,
        email: user.email,
        name: user.name,
        lastActive: user.last_active,
      });
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
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}