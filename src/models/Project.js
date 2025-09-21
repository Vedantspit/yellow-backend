const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  name: String,
  text: String, // extracted text
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  files: [fileSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Project", projectSchema);
