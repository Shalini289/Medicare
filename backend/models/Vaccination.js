const mongoose = require("mongoose");

const vaccinationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vaccineName: { type: String, required: true, trim: true },
  dose: { type: String, default: "", trim: true },
  dueDate: { type: Date, required: true },
  administeredDate: Date,
  provider: { type: String, default: "", trim: true },
  location: { type: String, default: "", trim: true },
  certificateUrl: { type: String, default: "", trim: true },
  notes: { type: String, default: "", trim: true },
  status: {
    type: String,
    enum: ["scheduled", "completed", "missed"],
    default: "scheduled",
  },
}, { timestamps: true });

vaccinationSchema.index({ user: 1, dueDate: 1, status: 1 });

module.exports =
  mongoose.models.Vaccination ||
  mongoose.model("Vaccination", vaccinationSchema);
