const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  prescriptionCode: { type: String, trim: true, unique: true, sparse: true },
  doctorName: { type: String, default: "", trim: true },
  diagnosis: { type: String, default: "", trim: true },
  issuedDate: { type: Date, default: Date.now },
  validUntil: Date,
  followUpDate: Date,
  status: {
    type: String,
    enum: ["active", "completed", "archived"],
    default: "active",
  },
  medicines: [
    {
      name: { type: String, required: true, trim: true },
      dosage: { type: String, default: "", trim: true },
      frequency: { type: String, default: "", trim: true },
      duration: { type: String, default: "", trim: true },
      instructions: { type: String, default: "", trim: true },
    },
  ],
  patientInstructions: { type: String, default: "", trim: true },
  digitalSignature: { type: String, default: "", trim: true },
  notes: { type: String, default: "", trim: true },
}, { timestamps: true });

prescriptionSchema.index({ user: 1, issuedDate: -1 });

module.exports =
  mongoose.models.Prescription ||
  mongoose.model("Prescription", prescriptionSchema);
