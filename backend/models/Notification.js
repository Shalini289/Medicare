const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  message: String,
  type: {
    type: String,
    enum: ["appointment", "chat", "hospital", "order", "system", "emergency", "pharmacy"],
    default: "system",
  },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
