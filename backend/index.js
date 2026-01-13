import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userAuthRoutes from "./routes/authRoutes.js";
import googleAuth from './routes/googleAuthRoutes.js'
import gmailRoutes from './routes/gmailRoutes.js'
import "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Constants
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get("/health", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/userAuth", userAuthRoutes);
app.use("/auth",googleAuth)
app.use("/gmail",gmailRoutes)


if (process.env.PROCESS_ROLE !== "worker") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
  });
}
