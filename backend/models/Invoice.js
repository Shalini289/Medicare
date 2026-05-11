const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true, sparse: true, trim: true },
  patientName: { type: String, required: true, trim: true },
  items: [
    {
      name: { type: String, trim: true },
      amount: { type: Number, default: 0 },
    },
  ],
  amount: { type: Number, default: 0 },
  dueDate: Date,
  status: {
    type: String,
    enum: ["draft", "unpaid", "paid", "overdue"],
    default: "unpaid",
  },
}, { timestamps: true });

module.exports =
  mongoose.models.Invoice ||
  mongoose.model("Invoice", invoiceSchema);
