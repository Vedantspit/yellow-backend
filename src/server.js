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
const authenticate = require("./middleware/auth");

const app = express();

// ------------------ CORS Setup ------------------
const allowedOrigins = ["http://localhost:5173", process.env.FRONTEND_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Incoming origin:", origin); // log for debugging
      if (!origin) return callback(null, true); // allow non-browser requests (Postman, server)
      if (allowedOrigins.includes(origin)) return callback(null, origin); // exact origin
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight OPTIONS requests globally
app.options("*", cors());

// ------------------ Middleware ------------------
app.use(express.json());

// ------------------ Routes ------------------
// Public routes (no JWT required)
app.use("/api/auth", authRoutes);

// Protected routes (JWT required)
app.use("/api/projects", authenticate, projectsRoutes);
app.use("/api/projects", authenticate, promptsRoutes);
app.use("/api/projects", authenticate, chatRoutes);
app.use("/api/messages", authenticate, messagesRoutes);
app.use("/api/files", authenticate, filesRoutes);

// ------------------ MongoDB Connection & Server Start ------------------
const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
