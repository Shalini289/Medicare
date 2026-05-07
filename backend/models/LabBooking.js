const mongoose = require("mongoose");

const labBookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tests: [
    {
      test: { type: mongoose.Schema.Types.ObjectId, ref: "LabTest", required: true },
      price: { type: Number, required: true },
    },
  ],
  collectionDate: { type: Date, required: true },
  slot: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  total: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ["scheduled", "sample_collected", "report_ready", "cancelled"],
    default: "scheduled",
  },
  notes: { type: String, default: "", trim: true },
}, { timestamps: true });

labBookingSchema.index({ user: 1, collectionDate: -1 });

module.exports =
  mongoose.models.LabBooking ||
  mongoose.model("LabBooking", labBookingSchema);
