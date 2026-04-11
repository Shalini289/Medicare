const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },

  rating: Number,
  comment: String,

  helpful: { type: Number, default: 0 }

}, { timestamps: true });

const Report =
  mongoose.models.Report ||
  mongoose.model("Report", reportSchema);

module.exports = Report;