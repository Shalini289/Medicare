const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true
    },

    symptoms: {
      type: String,
      required: true
    },

    report: {
      duration: String,
      painLevel: String
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    slot: {
      type: String,
      required: true
    },

    time: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);