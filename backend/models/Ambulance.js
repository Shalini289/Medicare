const mongoose = require("mongoose");

const ambulanceSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, trim: true },
  driverName: { type: String, default: "", trim: true },
  driverPhone: { type: String, default: "", trim: true },
  location: { type: String, default: "", trim: true },
  status: {
    type: String,
    enum: ["available", "dispatched", "maintenance", "offline"],
    default: "available",
  },
}, { timestamps: true });

module.exports =
  mongoose.models.Ambulance ||
  mongoose.model("Ambulance", ambulanceSchema);
