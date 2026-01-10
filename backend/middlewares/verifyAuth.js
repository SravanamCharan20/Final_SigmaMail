import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv"

dotenv.config();

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authorized, no token" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not configured");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "Not authorized, invalid token" });
    }

    req.user = user; // attach user to request
    next();

  } catch (error) {
    return res.status(401).json({ error: "Not authorized, invalid token" });
  }
};