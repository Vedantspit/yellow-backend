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

// ------------------ Allowed Origins ------------------
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL, // e.g., https://yellow-frontend.vercel.app
];

// ------------------ CORS Middleware ------------------
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Incoming origin:", origin); // debug
      if (!origin) return callback(null, true); // allow non-browser requests like Postman or server-to-server
      if (allowedOrigins.includes(origin)) return callback(null, origin); // exact allowed origin
      return callback(new Error("Not allowed by CORS")); // reject all others
    },
    credentials: true, // required for withCredentials
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle OPTIONS preflight requests globally
app.options(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ------------------ Middleware ------------------
app.use(express.json());

// ------------------ Routes ------------------
// Public routes (no JWT)
app.use("/api/auth", authRoutes);

// Protected routes (require JWT)
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
