const mongoose = require("mongoose");

const labTestSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, default: "General", trim: true },
  price: { type: Number, required: true, min: 0 },
  sampleType: { type: String, default: "Blood", trim: true },
  fastingRequired: { type: Boolean, default: false },
  reportTime: { type: String, default: "24 hours", trim: true },
  description: { type: String, default: "", trim: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

labTestSchema.index({ name: 1, category: 1 });

module.exports =
  mongoose.models.LabTest ||
  mongoose.model("LabTest", labTestSchema);
