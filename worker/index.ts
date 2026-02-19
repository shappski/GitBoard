import cron from "node-cron";
import { syncAllUsers } from "../lib/gitlab/sync";

const SYNC_SCHEDULE = process.env.SYNC_CRON || "*/15 * * * *";

console.log(`[Worker] Starting with schedule: ${SYNC_SCHEDULE}`);

cron.schedule(SYNC_SCHEDULE, async () => {
  console.log(`[Worker] Sync started at ${new Date().toISOString()}`);
  try {
    await syncAllUsers();
    console.log(`[Worker] Sync completed at ${new Date().toISOString()}`);
  } catch (error) {
    console.error("[Worker] Sync failed:", error);
  }
});

// Run initial sync on startup after a short delay
setTimeout(async () => {
  console.log("[Worker] Running initial sync...");
  try {
    await syncAllUsers();
    console.log("[Worker] Initial sync completed");
  } catch (error) {
    console.error("[Worker] Initial sync failed:", error);
  }
}, 5000);
