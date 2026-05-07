const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  file: String,
  extractedText: String,

  analysis: Object

}, { timestamps: true });

module.exports =
  mongoose.models.Report ||
  mongoose.model("Report", reportSchema);
