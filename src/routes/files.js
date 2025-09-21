// backend/src/routes/files.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const csv = require("csv-parser");
const authenticate = require("../middleware/auth");
const Project = require("../models/Project");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Helper: extract text from different file types
async function extractFileText(filePath, mimetype) {
  if (mimetype === "application/pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } else if (mimetype === "text/csv") {
    return new Promise((resolve, reject) => {
      const rows = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => rows.push(JSON.stringify(row)))
        .on("end", () => resolve(rows.join("\n")))
        .on("error", reject);
    });
  } else if (mimetype.startsWith("text/")) {
    return fs.readFileSync(filePath, "utf-8");
  } else {
    return ""; // unsupported type
  }
}

// Upload file route
router.post(
  "/:projectId/upload",
  authenticate,
  upload.single("file"),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const project = await Project.findOne({
        _id: projectId,
        ownerId: req.user.userId,
      });
      if (!project) return res.status(404).json({ error: "Project not found" });
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      // Extract text
      const text = await extractFileText(req.file.path, req.file.mimetype);

      // Save file info + text in project
      project.files.push({
        name: req.file.originalname,
        text,
      });

      await project.save();
      fs.unlinkSync(req.file.path);

      res.json({ success: true, project });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "File processing failed" });
    }
  }
);

module.exports = router;
