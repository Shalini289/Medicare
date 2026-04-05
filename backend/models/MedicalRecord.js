const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor"
    },

    reportUrl: {
      type: String, // file path or cloud URL
      required: true
    },

    reportType: {
      type: String, // e.g. "X-Ray", "Blood Test"
    },

    notes: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);