const mongoose = require("mongoose");

const adherenceSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    medicineName: {
      type: String,
      required: true
    },

    date: {
      type: String, // "YYYY-MM-DD"
      required: true
    },

    status: {
      type: String,
      enum: ["taken", "missed"],
      default: "missed"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdherenceLog", adherenceSchema);