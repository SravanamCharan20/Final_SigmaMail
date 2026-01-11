import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userAuthRoutes from "./routes/authRoutes.js";

dotenv.config();

// Constants
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URL = process.env.MONGODB_URL;

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

app.use("/userAuth", userAuthRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
