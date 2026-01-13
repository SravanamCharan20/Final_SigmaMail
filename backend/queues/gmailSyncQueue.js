import { Queue } from "bullmq";
import { redis } from "../utils/redis.js";

export const gmailSyncQueue = new Queue("gmail-sync", {
  connection: redis,
});