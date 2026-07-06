const mongoose = require("mongoose");

const hospitalReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: "", trim: true },
}, { timestamps: true });

hospitalReviewSchema.index({ user: 1, hospital: 1 }, { unique: true });

module.exports =
  mongoose.models.HospitalReview ||
  mongoose.model("HospitalReview", hospitalReviewSchema);
