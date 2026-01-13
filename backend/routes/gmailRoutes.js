import express from "express";
import { requireAuth } from "../middlewares/verifyAuth.js";
import { connectedAccounts, deleteAccount } from "../controllers/gmailControllers.js";
import Email from "../models/emails.js";
import { gmailSyncQueue } from "../queues/gmailSyncQueue.js";


const router = express.Router();

router.get("/connected-accounts", requireAuth, connectedAccounts);
router.delete("/connected-accounts/:id", requireAuth, deleteAccount);

router.post("/incremental-sync", requireAuth, async (req, res) => {
  const { accountId } = req.query;

  if (!accountId) {
    return res.status(400).json({ message: "accountId is required" });
  }

  await gmailSyncQueue.add(
    "incremental-sync",
    {
      type: "incremental",
      userId: req.user._id,
      gmailAccountId: accountId,
    },
    {
      jobId: `incremental-${accountId}`, // dedupe
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  return res.json({ ok: true });
});

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

  let nextCursor =
    messages.length > 0
      ? messages[messages.length - 1].internalDate
      : null;

  res.json({
    messages,
    nextCursor,
  });
});

router.get("/messages/latest", requireAuth, async (req, res) => {
  const { accountId, after } = req.query;

  if (!accountId || !after) {
    return res.json({ messages: [] });
  }

  const messages = await Email.find({
    user: req.user._id,
    gmailAccount: accountId,
    internalDate: { $gt: new Date(after) },
  })
    .sort({ internalDate: -1 })
    .limit(10);

  return res.json({ messages });
});

export default router;
