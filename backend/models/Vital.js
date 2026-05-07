const mongoose = require("mongoose");

const vitalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recordedAt: { type: Date, default: Date.now },
  systolic: Number,
  diastolic: Number,
  pulse: Number,
  oxygen: Number,
  temperature: Number,
  bloodSugar: Number,
  weight: Number,
  notes: { type: String, default: "", trim: true },
}, { timestamps: true });

vitalSchema.index({ user: 1, recordedAt: -1 });

module.exports =
  mongoose.models.Vital ||
  mongoose.model("Vital", vitalSchema);
