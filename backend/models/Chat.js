const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  message: String
}, { timestamps: true });

module.exports =
  mongoose.models.Chat ||
  mongoose.model("Chat", chatSchema);
