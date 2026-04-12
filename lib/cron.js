import cron from "node-cron";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export function startCronJobs() {
  // Runs every day at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("⏳ Running host expiry check...");

    try {
      await connectToDatabase();

      const expiredHosts = await User.find({
        role: "host",
        status: "confirmed",
        hostExpiryDate: { $lt: new Date() },
      });

      for (const user of expiredHosts) {
        user.status = "pending";
        user.hostExpiryDate = null;
        await user.save();
      }

      console.log(`✅ Updated ${expiredHosts.length} expired hosts`);
    } catch (err) {
      console.error("❌ Cron error:", err);
    }
  });
}