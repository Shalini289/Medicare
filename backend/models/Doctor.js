const mongoose = require("mongoose");
const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, default: 1 },
    rating: { type: Number, default: 4 },

    availableSlots: [
      {
        date: {
          type: Date,
          required: true
        },
        time: {
          type: String, // "10:00 AM"
          required: true
        },
        isBooked: {
          type: Boolean,
          default: false
        }
      }
    ]
  },
  { timestamps: true }
);