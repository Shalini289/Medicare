const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },

  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: "", trim: true },

  helpful: { type: Number, default: 0 }

}, { timestamps: true });

reviewSchema.index({ user: 1, doctor: 1 }, { unique: true });

module.exports =
  mongoose.models.Review ||
  mongoose.model("Review", reviewSchema);
