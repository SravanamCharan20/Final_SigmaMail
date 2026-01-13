import "dotenv/config";
import "../config/db.js";
import { Worker } from "bullmq";
import { google } from "googleapis";
import { redis } from "../utils/redis.js";
import Email from "../models/emails.js";
import { decrypt } from "../utils/crypto.js";
import GmailAccount from "../models/gmailAccounts.js";

console.log("🚀 Gmail Sync Worker started and listening for jobs...");

const getHeader = (payload, name) =>
  payload.headers.find((h) => h.name === name)?.value || "";

new Worker(
  "gmail-sync",
  async (job) => {
    const { userId, gmailAccountId } = job.data;
    const MAX_INITIAL_EMAILS = 20;
    let syncedCount = 0;

    console.log("📥 Sync job received:", job.data);

    // 1️⃣ FETCH ACCOUNT (NO UPDATE HERE)
    const account = await GmailAccount.findById(gmailAccountId);

    if (!account) {
      console.log("❌ Gmail account not found");
      return;
    }

    if (account.isInitialSynced) {
      console.log("⏭️ Initial sync already done. Skipping.");
      return;
    }

    console.log("✅ Starting initial sync");

    // 2️⃣ Gmail client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: decrypt(account.accessToken),
      refresh_token: decrypt(account.refreshToken),
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    let pageToken;

    do {
      const listRes = await gmail.users.messages.list({
        userId: "me",
        maxResults: 20,
        pageToken,
      });

      pageToken = listRes.data.nextPageToken;

      for (const msg of listRes.data.messages || []) {
        if (syncedCount >= MAX_INITIAL_EMAILS) break;

        const exists = await Email.findOne({
          gmailAccount: gmailAccountId,
          messageId: msg.id,
        });
        if (exists) continue;

        const full = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "metadata",
        });

        const payload = full.data.payload;

        await Email.create({
          user: userId,
          gmailAccount: gmailAccountId,
          messageId: msg.id,
          threadId: full.data.threadId,
          from: getHeader(payload, "From"),
          to: getHeader(payload, "To"),
          subject: getHeader(payload, "Subject"),
          snippet: full.data.snippet,
          internalDate: new Date(Number(full.data.internalDate)),
          isRead: !full.data.labelIds?.includes("UNREAD"),
          isStarred: full.data.labelIds?.includes("STARRED"),
        });

        syncedCount++;
      }
    } while (pageToken && syncedCount < MAX_INITIAL_EMAILS);

    // 3️⃣ MARK SYNC COMPLETE (THIS WAS MISSING)
    await GmailAccount.updateOne(
      { _id: gmailAccountId },
      { $set: { isInitialSynced: true } }
    );

    console.log("✅ Initial Gmail sync completed & flag updated");
  },
  { connection: redis }
);