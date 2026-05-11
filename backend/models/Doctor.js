const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: String,
  specialization: String,
  image: String,
  hospital: String,
  about: String,
  experience: Number,
  fees: Number,
  rating: { type: Number, default: 0 },
  availability: String,
  availableToday: { type: Boolean, default: true }
}, { timestamps: true });

module.exports =
  mongoose.models.Doctor ||
  mongoose.model("Doctor", doctorSchema);
