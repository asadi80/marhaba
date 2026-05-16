// lib/cron.js - POSTGRESQL VERSION
import cron from "node-cron";
import pool from "@/lib/postgres";

export function startCronJobs() {
  // Runs every day at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("⏳ Running host expiry check...");

    try {
      // Find expired hosts
      const expiredHostsResult = await pool.query(
        `SELECT id, name, email, host_details 
         FROM users 
         WHERE role = 'host' 
         AND status = 'confirmed' 
         AND host_expiry_date < NOW()`,
        []
      );

      const expiredHosts = expiredHostsResult.rows;

      if (expiredHosts.length > 0) {
        // Update all expired hosts in a single transaction
        const client = await pool.connect();
        
        try {
          await client.query('BEGIN');
          
          for (const host of expiredHosts) {
            // Update host status
            await client.query(
              `UPDATE users 
               SET status = 'pending', 
                   status_reason = 'expired',
                   host_expiry_date = NULL,
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = $1`,
              [host.id]
            );
            
            // Deactivate all listings for this host
            await client.query(
              `UPDATE listings 
               SET status = 'inactive', 
                   updated_at = CURRENT_TIMESTAMP
               WHERE host_id = $1`,
              [host.id]
            );
          }
          
          await client.query('COMMIT');
          console.log(`✅ Updated ${expiredHosts.length} expired hosts and deactivated their listings`);
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      } else {
        console.log("✅ No expired hosts found");
      }
    } catch (err) {
      console.error("❌ Cron error:", err);
    }
  });

  console.log("⏰ Cron jobs started - Host expiry check scheduled for midnight daily");
}

// Optional: Function to run expiry check manually (for testing)
export async function runExpiryCheckManually() {
  console.log("⏳ Running manual host expiry check...");

  try {
    const expiredHostsResult = await pool.query(
      `SELECT id, name, email, host_details 
       FROM users 
       WHERE role = 'host' 
       AND status = 'confirmed' 
       AND host_expiry_date < NOW()`,
      []
    );

    const expiredHosts = expiredHostsResult.rows;

    if (expiredHosts.length > 0) {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        for (const host of expiredHosts) {
          await client.query(
            `UPDATE users 
             SET status = 'pending', 
                 status_reason = 'expired',
                 host_expiry_date = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [host.id]
          );
          
          await client.query(
            `UPDATE listings 
             SET status = 'inactive', 
                 updated_at = CURRENT_TIMESTAMP
             WHERE host_id = $1`,
            [host.id]
          );
        }
        
        await client.query('COMMIT');
        console.log(`✅ Updated ${expiredHosts.length} expired hosts`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      console.log("✅ No expired hosts found");
    }

    return {
      success: true,
      updatedCount: expiredHosts.length,
      expiredHosts: expiredHosts.map(h => ({ id: h.id, name: h.name, email: h.email }))
    };
  } catch (err) {
    console.error("❌ Manual expiry check error:", err);
    return {
      success: false,
      error: err.message
    };
  }
}

// Optional: Function to check expiring hosts (for notification system)
export async function getExpiringHosts(daysBeforeExpiry = 7) {
  try {
    const expiringHostsResult = await pool.query(
      `SELECT id, name, email, host_expiry_date, host_details
       FROM users 
       WHERE role = 'host' 
       AND status = 'confirmed' 
       AND host_expiry_date > NOW()
       AND host_expiry_date < NOW() + INTERVAL '${daysBeforeExpiry} days'`,
      []
    );

    return expiringHostsResult.rows;
  } catch (err) {
    console.error("Error getting expiring hosts:", err);
    return [];
  }
}