const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({
  name: String,
  city: String,

  beds: {
    ICU: Number,
    oxygen: Number,
    general: Number
  }
});

module.exports =
  mongoose.models.Hospital ||
  mongoose.model("Hospital", hospitalSchema);
