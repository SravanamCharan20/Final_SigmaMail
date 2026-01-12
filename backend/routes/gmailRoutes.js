import express from "express";
import { requireAuth } from "../middlewares/verifyAuth.js";
import { connectedAccounts, deleteAccount } from "../controllers/gmailControllers.js";
import { google } from "googleapis";
import gmailAccounts from "../models/gmailAccounts.js";
import { decrypt } from "../utils/crypto.js";
import Email from "../models/emails.js";


const router = express.Router();

router.get("/connected-accounts", requireAuth, connectedAccounts);
router.delete("/connected-accounts/:id", requireAuth, deleteAccount);

router.post("/sync", requireAuth, async (req, res) => {
  try {
    const accounts = await gmailAccounts.find({
      user: req.user._id,
      isActive: true,
    });

    if (accounts.length === 0) {
      return res.status(404).json({
        message: "No active Gmail accounts found to sync",
      });
    }

    let totalSynced = 0;

    for (const account of accounts) {
      const accessToken = decrypt(account.accessToken);

      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      const listRes = await gmail.users.messages.list({
        userId: "me",
        maxResults: 50,
        labelIds: ["INBOX"],
      });

      const messages = listRes.data.messages || [];
      if (messages.length === 0) continue;

      const ops = [];

      for (const msg of messages) {
        const msgRes = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "metadata",
          metadataHeaders: ["From", "To", "Subject", "Date"],
        });

        const headers = msgRes.data.payload.headers;
        const getHeader = (name) =>
          headers.find((h) => h.name === name)?.value || "";

        ops.push({
          updateOne: {
            filter: {
              gmailAccount: account._id,
              messageId: msg.id,
            },
            update: {
              $setOnInsert: {
                user: req.user._id,
                gmailAccount: account._id,
                messageId: msg.id,
                threadId: msgRes.data.threadId,
                from: getHeader("From"),
                to: getHeader("To"),
                subject: getHeader("Subject"),
                snippet: msgRes.data.snippet,
                internalDate: new Date(
                  Number(msgRes.data.internalDate)
                ),
              },
            },
            upsert: true,
          },
        });
      }

      if (ops.length > 0) {
        await Email.bulkWrite(ops);
        totalSynced += ops.length;
      }
    }

    res.json({
      message: "Gmail sync completed",
      syncedCount: totalSynced,
    });
  } catch (err) {
    console.error("Gmail sync error →", err?.response?.data || err);
    res.status(500).json({
      message: "Failed to sync Gmail messages",
    });
  }
});

router.get("/messages", requireAuth, async (req, res) => {
  try {
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).json({ message: "Missing accountId" });
    }

    const messages = await Email.find({
      user: req.user._id,
      gmailAccount: accountId,
    })
      .sort({ internalDate: -1 })
      .limit(50);

    res.json({ messages });
  } catch (err) {
    console.error("Fetch DB messages error →", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

export default router;
