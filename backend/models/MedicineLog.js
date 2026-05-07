const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  medicine: { type: String, required: true, trim: true },
  dosage: { type: String, default: "", trim: true },
  frequency: {
    type: String,
    enum: ["once", "twice", "daily", "weekly", "as-needed"],
    default: "daily",
  },
  time: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  notes: { type: String, default: "", trim: true },
  taken: { type: Boolean, default: false },
  lastTakenAt: Date,
  lastReminderSentAt: Date,
  active: { type: Boolean, default: true },
}, { timestamps: true });

logSchema.index({ user: 1, active: 1, time: 1 });

module.exports =
  mongoose.models.MedicineLog ||
  mongoose.model("MedicineLog", logSchema);
