const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    sparse: true,
  },
  name: String,
  specialization: String,
  image: String,
  hospital: String,
  about: String,
  experience: Number,
  fees: Number,
  rating: { type: Number, default: 0 },
  availability: String,
  availableToday: { type: Boolean, default: true },
  availabilitySchedule: [
    {
      day: { type: String, trim: true },
      startTime: { type: String, trim: true },
      endTime: { type: String, trim: true },
      mode: {
        type: String,
        enum: ["clinic", "video", "both"],
        default: "both",
      },
    },
  ],
  slotDurationMinutes: { type: Number, default: 30 }
}, { timestamps: true });

module.exports =
  mongoose.models.Doctor ||
  mongoose.model("Doctor", doctorSchema);
