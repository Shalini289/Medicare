const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  head: { type: String, default: "", trim: true },
  phone: { type: String, default: "", trim: true },
  beds: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["active", "limited", "closed"],
    default: "active",
  },
}, { timestamps: true });

module.exports =
  mongoose.models.Department ||
  mongoose.model("Department", departmentSchema);
