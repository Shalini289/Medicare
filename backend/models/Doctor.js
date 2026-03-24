const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    specialization: {
      type: String,
      required: true
    },

    experience: {
      type: Number, // years
      default: 1
    },

    rating: {
      type: Number,
      default: 4
    },

    availableSlots: [
      {
        type: String // "10:00 AM"
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);