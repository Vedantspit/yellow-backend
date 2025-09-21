const express = require("express");
const router = express.Router();
const Prompt = require("../models/Prompt");
const Project = require("../models/Project");
const authenticate = require("../middleware/auth");

// Add a prompt to a project
router.post("/:projectId/prompts", authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, content } = req.body;
    if (!name || !content)
      return res.status(400).json({ error: "Name and content required" });

    // Check if user owns the project
    const project = await Project.findOne({
      _id: projectId,
      ownerId: req.user.userId,
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const prompt = await Prompt.create({
      projectId,
      name,
      content,
    });

    res.json(prompt);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all prompts for a project
router.get("/:projectId/prompts", authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      ownerId: req.user.userId,
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const prompts = await Prompt.find({ projectId });
    res.json(prompts);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
