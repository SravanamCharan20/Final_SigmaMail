import express from "express";
import { google } from "googleapis";
import { oauth2Client } from "../utils/googleClient.js";
import { encrypt } from "../utils/crypto.js";
import GmailAccount from "../models/gmailAccounts.js";
import { gmailSyncQueue } from "../queues/gmailSyncQueue.js";
import mongoose from "mongoose";

const router = express.Router();

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

/**
 * STEP 1: Start Gmail OAuth
 */
router.get("/google", (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId for Gmail OAuth" });
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state: userId,
  });

  res.redirect(url);
});

/**
 * STEP 2: OAuth callback
 */
router.get("/google/callback", async (req, res) => {
  const { code, state } = req.query;
  const userObjectId = new mongoose.Types.ObjectId(state);

  try {
    // 1. Exchange code → tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 2. Gmail API client
    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client,
    });

    // 3. Get Gmail email address
    const profile = await gmail.users.getProfile({
      userId: "me",
    });

    const gmailEmail = profile.data.emailAddress;

    // 4. Store Gmail account (ONE DOCUMENT PER ACCOUNT)
    
    const savedAccount = await GmailAccount.findOneAndUpdate(
      {
        user: userObjectId,
        emailAddress: gmailEmail,
      },
      {
        $set: {
          accessToken: encrypt(tokens.access_token),
          refreshToken: encrypt(tokens.refresh_token),
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          isActive: true, // re-activate if previously disconnected
        },
        $setOnInsert: {
          user: userObjectId,
          emailAddress: gmailEmail,
          isInitialSynced: false,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    if (!savedAccount.isInitialSynced) {
      await gmailSyncQueue.add(
        "initial-sync",
        {
          userId: state,
          gmailAccountId: savedAccount._id,
        },
        {
          jobId: `initial-sync-${savedAccount._id}`,
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
    }

    // 5. Redirect back to frontend
    res.redirect("http://localhost:3000/dashboard");
  } catch (err) {
    console.error("Gmail OAuth error:", err);
    res.status(500).send("Gmail auth failed");
  }
});

export default router;
