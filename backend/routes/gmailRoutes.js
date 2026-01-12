import express from "express";
import { requireAuth } from "../middlewares/verifyAuth.js";
import { connectedAccounts, deleteAccount } from "../controllers/gmailAuthControllers.js";

const router = express.Router();

router.get("/connected-accounts", requireAuth, connectedAccounts);
router.delete("/connected-accounts/:id", requireAuth, deleteAccount);

export default router;
