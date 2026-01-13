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

router.get("/messages", requireAuth, async (req, res) => {
  const { accountId, cursor } = req.query;

  const query = {
    user: req.user._id,
  };

  if (accountId) {
    query.gmailAccount = accountId;
  }

  if (cursor) {
    query.internalDate = { $lt: new Date(cursor) };
  }

  const messages = await Email.find(query)
    .sort({ internalDate: -1 })
    .limit(20);

  res.json(messages);
});

export default router;
