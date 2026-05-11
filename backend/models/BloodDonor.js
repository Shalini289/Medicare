const mongoose = require("mongoose");

const bloodDonorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
  name: { type: String, required: true, trim: true },
  bloodGroup: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
  city: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, default: "", trim: true },
  age: { type: Number, min: 18, max: 65 },
  lastDonationDate: Date,
  available: { type: Boolean, default: true },
  emergencyOnly: { type: Boolean, default: false },
  notes: { type: String, default: "", trim: true },
}, { timestamps: true });

bloodDonorSchema.index({ bloodGroup: 1, city: 1, available: 1 });

module.exports =
  mongoose.models.BloodDonor ||
  mongoose.model("BloodDonor", bloodDonorSchema);
