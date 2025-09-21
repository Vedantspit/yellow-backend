require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const projectsRoutes = require("./routes/projects");
const promptsRoutes = require("./routes/prompts");
const chatRoutes = require("./routes/chat");
const filesRoutes = require("./routes/files");
const messagesRoutes = require("./routes/messages");

const app = express();

// ------------------ CORS Setup ------------------
const allowedOrigins = [
  "http://localhost:5173", // local dev
  process.env.FRONTEND_URL, // deployed frontend on Vercel
];

// Middleware to handle CORS for all requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin); // exact origin
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ------------------ Middleware ------------------
app.use(express.json());

// ------------------ Routes ------------------
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/projects", promptsRoutes);
app.use("/api/projects", chatRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/files", filesRoutes);

// ------------------ Connect MongoDB & Start Server ------------------
const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
