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
  "http://localhost:5173", // local development
  process.env.FRONTEND_URL, // deployed frontend on Vercel
];

// Apply CORS middleware to all routes
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman or server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true); // allow
      } else {
        return callback(null, false); // reject silently
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle all OPTIONS preflight requests
app.options("*", cors());

// ------------------ Middleware ------------------
app.use(express.json());

// ------------------ Routes ------------------
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/projects", promptsRoutes);
app.use("/api/projects", chatRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/files", filesRoutes); // POST /api/files/:projectId/upload

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
