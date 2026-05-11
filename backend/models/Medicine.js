const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  category: { type: String, default: "", trim: true },
  supplier: { type: String, default: "", trim: true },
  reorderLevel: { type: Number, default: 10 },
  barcode: { type: String, default: "", trim: true, index: true },
  batchNumber: { type: String, default: "", trim: true },
  expiryDate: Date,
  description: String,
  image: String
}, { timestamps: true });

module.exports =
  mongoose.models.Medicine ||
  mongoose.model("Medicine", medicineSchema);
