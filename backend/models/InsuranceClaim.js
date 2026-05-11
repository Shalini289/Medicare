const mongoose = require("mongoose");

const insuranceClaimSchema = new mongoose.Schema({
  claimNumber: { type: String, unique: true, sparse: true, trim: true },
  patientName: { type: String, required: true, trim: true },
  provider: { type: String, required: true, trim: true },
  policyNumber: { type: String, default: "", trim: true },
  amount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["submitted", "under-review", "approved", "rejected", "paid"],
    default: "submitted",
  },
  notes: { type: String, default: "", trim: true },
}, { timestamps: true });

module.exports =
  mongoose.models.InsuranceClaim ||
  mongoose.model("InsuranceClaim", insuranceClaimSchema);
