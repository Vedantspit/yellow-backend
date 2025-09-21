const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const Project = require("../models/Project");
const Prompt = require("../models/Prompt");
const Message = require("../models/Message");
const axios = require("axios");

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

// Chat with OpenRouter using project context
router.post("/:projectId/chat", authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    // Ensure project belongs to logged-in user
    const project = await Project.findOne({
      _id: projectId,
      ownerId: req.user.userId,
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Fetch project prompt
    const promptDoc = await Prompt.findOne({ projectId });
    const promptText = promptDoc?.content || "You are a helpful assistant.";

    // Include uploaded file content (trimmed to max 2000 chars per file)
    let fileText = "";
    if (project.files?.length > 0) {
      project.files.forEach((f) => {
        fileText += `File ${f.name}:\n${f.text.slice(0, 2000)}\n\n`;
      });
    }

    // Save the user message
    await Message.create({ projectId, role: "user", text: message });

    // Fetch last 10 messages for context
    const pastMessages = await Message.find({ projectId })
      .sort({ createdAt: -1 })
      .limit(10);
    pastMessages.reverse(); // chronological order

    // Construct conversation
    let conversation = `${promptText}\n${fileText}`;
    pastMessages.forEach((m) => {
      conversation += `${m.role === "user" ? "User" : "Assistant"}: ${
        m.text
      }\n`;
    });
    conversation += `User: ${message}\nAssistant:`;

    // Call OpenRouter Completion API
    const response = await axios.post(
      "https://openrouter.ai/api/v1/completions",
      {
        model: "gpt-4o-mini",
        prompt: conversation,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const assistantMessage =
      response.data?.choices?.[0]?.text?.trim() || "No response";

    // Save assistant message
    await Message.create({
      projectId,
      role: "assistant",
      text: assistantMessage,
    });

    res.json({ message: assistantMessage });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
