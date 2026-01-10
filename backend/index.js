import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

// Constants
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URL = process.env.MONGODB_URL;
const JWT_SECRET = process.env.JWT_SECRET;

// Middlewares
app.use(cors());
app.use(express.json());

// DB Connection
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

// Routes
app.get("/health", (req, res) => {
  res.json({ message: "Server is running" });
});

app.post("/auth/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const {password : _,...withoutPassword} = newUser.toObject();

    res.status(201).json({
      message: "User created successfully",
      user: withoutPassword,
    });
  } catch (error) {
    console.log("Error in Signup", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Signin successful",
      token,
    });
  } catch (error) {
    console.error("Error in Signin:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
