import express from "express";
import GmailAccount from "../models/gmailAccounts.js";
import { requireAuth } from "../middlewares/verifyAuth.js";

const router = express.Router();

router.get("/connected-accounts", requireAuth, async (req, res) => {
  try {
    const accounts = await GmailAccount.find({
      user: req.user._id,
      isActive: true,
    }).select("emailAddress createdAt");

    if (accounts.length === 0) {
      return res.status(404).json({
        message: "No Gmail accounts connected",
        accounts: [],
      });
    }

    res.status(200).json({
      message: "Fetched accounts successfully",
      accounts,
    });
  } catch (error) {
    console.error("Accounts fetch error:", error);
    res.status(500).json({
      message: "Accounts fetch error",
    });
  }
});

export default router;