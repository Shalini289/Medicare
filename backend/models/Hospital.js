const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  city: String,
  address: { type: String, default: "", trim: true },
  phone: { type: String, default: "", trim: true },
  emergencyPhone: { type: String, default: "", trim: true },
  status: {
    type: String,
    enum: ["active", "limited", "closed"],
    default: "active"
  },

  beds: {
    ICU: Number,
    oxygen: Number,
    general: Number
  },

  occupiedBeds: {
    ICU: { type: Number, default: 0 },
    oxygen: { type: Number, default: 0 },
    general: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports =
  mongoose.models.Hospital ||
  mongoose.model("Hospital", hospitalSchema);
