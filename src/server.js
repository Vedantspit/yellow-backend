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
  process.env.FRONTEND_URL, // deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
