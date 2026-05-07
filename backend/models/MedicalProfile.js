const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: { type: String, default: "", trim: true },
  relation: { type: String, default: "", trim: true },
  phone: { type: String, default: "", trim: true },
}, { _id: false });

const insuranceSchema = new mongoose.Schema({
  provider: { type: String, default: "", trim: true },
  policyNumber: { type: String, default: "", trim: true },
  validTill: Date,
}, { _id: false });

const medicalProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  bloodGroup: { type: String, default: "", trim: true },
  allergies: [{ type: String, trim: true }],
  conditions: [{ type: String, trim: true }],
  currentMedications: [{ type: String, trim: true }],
  emergencyContacts: [contactSchema],
  insurance: insuranceSchema,
  primaryDoctor: { type: String, default: "", trim: true },
  organDonor: { type: Boolean, default: false },
  notes: { type: String, default: "", trim: true },
}, { timestamps: true });

module.exports =
  mongoose.models.MedicalProfile ||
  mongoose.model("MedicalProfile", medicalProfileSchema);
