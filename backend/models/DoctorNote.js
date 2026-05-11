const mongoose = require("mongoose");

const doctorNoteSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  type: {
    type: String,
    enum: ["consultation", "follow-up", "procedure", "voice-note", "diagnosis"],
    default: "consultation",
  },
  title: { type: String, default: "", trim: true },
  transcript: { type: String, default: "", trim: true },
  summary: { type: String, default: "", trim: true },
  diagnosisSuggestions: [{ type: String, trim: true }],
  plan: { type: String, default: "", trim: true },
}, { timestamps: true });

doctorNoteSchema.index({ doctor: 1, patient: 1, createdAt: -1 });

module.exports =
  mongoose.models.DoctorNote ||
  mongoose.model("DoctorNote", doctorNoteSchema);
