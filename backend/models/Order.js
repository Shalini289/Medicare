const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: String,

    items: [
      {
        medicineId: mongoose.Schema.Types.ObjectId,
        quantity: Number
      }
    ],

    totalAmount: Number,

    status: {
      type: String,
      enum: ["placed", "packed", "shipped", "delivered"],
      default: "placed"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);