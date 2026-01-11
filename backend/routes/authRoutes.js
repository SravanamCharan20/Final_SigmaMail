import express from "express";
import { Me, SignIn, SignUp } from "../controllers/userAuthControllers.js";
import { requireAuth } from "../middlewares/verifyAuth.js";

const router = express.Router();

router.post("/signup", SignUp);
router.post("/signin", SignIn);
router.get("/me", requireAuth, Me);

export default router;
