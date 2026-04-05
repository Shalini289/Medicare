const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
      trim: true
    },

    symptoms: {
      type: String,
      required: true,
      trim: true
    },

    report: {
      duration: {
        type: String,
        enum: ["1 day", "2-3 days", "1 week", "chronic"],
        default: "1 day"
      },
      painLevel: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low"
      }
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    slot: {
      type: String,
      required: true
      // Example: "10:00 AM - 10:30 AM"
    },

    // optional exact datetime (better than separate time)
    appointmentDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending"
    },
    reminderSent: {
  type: Boolean,
  default: false
},
  },
  
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);