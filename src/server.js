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

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/projects", promptsRoutes);
app.use("/api/projects", chatRoutes);
app.use("/api/messages", messagesRoutes);

app.use("/api/files", filesRoutes); // now POST /api/files/:projectId/upload works

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error(err));
