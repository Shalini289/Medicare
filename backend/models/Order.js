const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  items: [
    {
      medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
      quantity: Number
    }
  ],

  total: Number,

  status: {
    type: String,
    enum: ["pending", "paid", "delivered"],
    default: "pending"
  },

  paymentId: String

}, { timestamps: true });

module.exports =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);