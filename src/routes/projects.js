const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const Project = require("../models/Project");
const Prompt = require("../models/Prompt");

// Create a new project with optional prompt
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, prompt } = req.body;
    if (!name) return res.status(400).json({ error: "Project name required" });

    const project = await Project.create({
      name,
      ownerId: req.user.userId,
    });

    const promptContent =
      prompt?.trim() ||
      "You are a helpful assistant. Answer concisely and politely.";

    await Prompt.create({
      projectId: project._id,
      name: "Default Prompt",
      content: promptContent,
    });

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all projects for the logged-in user
router.get("/", authenticate, async (req, res) => {
  try {
    const projects = await Project.find({ ownerId: req.user.userId });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
