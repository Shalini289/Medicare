const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
  description: String,
  image: String
});

module.exports =
  mongoose.models.Medicine ||
  mongoose.model("Medicine", medicineSchema);
