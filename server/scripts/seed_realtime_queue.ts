import { seedRealtimeQueue } from "../src/utils/seedRealtimeQueue.js";
import { logger } from "../src/utils/logger.js";

seedRealtimeQueue()
  .then(() => {
    logger.info("Realtime queue seed finished successfully.");
    process.exit(0);
  })
  .catch((err) => {
    logger.error("Realtime queue seed failed:", err);
    process.exit(1);
  });
