const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({
  name: String,
  city: String,

  beds: {
    ICU: Number,
    oxygen: Number,
    general: Number
  },

  occupiedBeds: {
    ICU: { type: Number, default: 0 },
    oxygen: { type: Number, default: 0 },
    general: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports =
  mongoose.models.Hospital ||
  mongoose.model("Hospital", hospitalSchema);
