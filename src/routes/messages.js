const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const Project = require("../models/Project");
const Message = require("../models/Message");

// GET messages for a project
router.get("/:projectId", authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if project exists and belongs to user
    const project = await Project.findOne({
      _id: projectId,
      ownerId: req.user.userId,
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Fetch messages
    const messages = await Message.find({ projectId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
