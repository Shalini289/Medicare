const mongoose = require("mongoose");

const storedReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, default: "General", trim: true },
  reportDate: Date,
  fileName: { type: String, required: true, trim: true },
  originalName: { type: String, required: true, trim: true },
  filePath: { type: String, required: true, trim: true },
  mimeType: { type: String, default: "application/pdf", trim: true },
  size: { type: Number, default: 0 },
  notes: { type: String, default: "", trim: true },
}, { timestamps: true });

storedReportSchema.index({ user: 1, createdAt: -1 });

module.exports =
  mongoose.models.StoredReport ||
  mongoose.model("StoredReport", storedReportSchema);
