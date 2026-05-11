const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, default: "", trim: true },
  department: { type: String, default: "", trim: true },
  phone: { type: String, default: "", trim: true },
  shift: { type: String, default: "General", trim: true },
  status: {
    type: String,
    enum: ["active", "on-leave", "inactive"],
    default: "active",
  },
}, { timestamps: true });

module.exports =
  mongoose.models.Staff ||
  mongoose.model("Staff", staffSchema);
