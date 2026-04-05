const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: String,
    location: String,

    beds: {
      icu: { type: Number, default: 0 },
      general: { type: Number, default: 0 }
    },

    oxygenAvailable: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hospital", hospitalSchema);