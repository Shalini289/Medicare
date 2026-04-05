const mongoose = require("mongoose");

const medicineReminderSchema = new mongoose.Schema(
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

    time: {
      type: String, // "08:00 AM"
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicineReminder", medicineReminderSchema);