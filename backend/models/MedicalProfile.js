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

const historySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["visit", "diagnosis", "procedure", "surgery", "admission", "lab", "imaging", "vaccination", "other"],
    default: "visit",
  },
  title: { type: String, default: "", trim: true },
  doctorName: { type: String, default: "", trim: true },
  facility: { type: String, default: "", trim: true },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: "", trim: true },
  attachments: [{ type: String, trim: true }],
}, { _id: true });

const medicalProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  bloodGroup: { type: String, default: "", trim: true },
  allergies: [{ type: String, trim: true }],
  conditions: [{ type: String, trim: true }],
  currentMedications: [{ type: String, trim: true }],
  medicalHistory: [historySchema],
  emergencyContacts: [contactSchema],
  insurance: insuranceSchema,
  primaryDoctor: { type: String, default: "", trim: true },
  organDonor: { type: Boolean, default: false },
  notes: { type: String, default: "", trim: true },
}, { timestamps: true });

module.exports =
  mongoose.models.MedicalProfile ||
  mongoose.model("MedicalProfile", medicalProfileSchema);
