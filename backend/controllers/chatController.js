const Chat = require("../models/Chat");
const Doctor = require("../models/Doctor");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

const getMessages = async (req, res) => {
  const doctorId = req.query.doctor;

  if (doctorId && !mongoose.isValidObjectId(doctorId)) {
    return res.status(400).json({ msg: "Invalid doctor selected" });
  }

  const query = {
    $or: [{ sender: req.user.id }, { receiver: req.user.id }],
  };

  if (doctorId) {
    query.doctor = doctorId;
  }

  const messages = await Chat.find(query)
    .populate("sender receiver", "name role")
    .populate("doctor", "name specialization image hospital")
    .sort({ createdAt: 1 });

  res.json(messages);
};

const sendMessage = async (req, res) => {
  if (!req.body.message?.trim()) {
    return res.status(400).json({ msg: "Message is required" });
  }

  const doctorId = req.body.doctor || req.body.receiverDoctor || null;

  if (!req.body.receiver && !doctorId) {
    return res.status(400).json({ msg: "Select a doctor before sending a message" });
  }

  if (doctorId) {
    if (!mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({ msg: "Invalid doctor selected" });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ msg: "Doctor not found" });
    }
  }

  const msg = await Chat.create({
    sender: req.user.id,
    receiver: req.body.receiver || null,
    doctor: doctorId,
    message: req.body.message.trim()
  });

  const populated = await msg.populate([
    { path: "sender receiver", select: "name role" },
    { path: "doctor", select: "name specialization image hospital" }
  ]);

  if (req.body.receiver) {
    await Notification.create({
      user: req.body.receiver,
      title: "New chat message",
      message: req.body.message.trim(),
      type: "chat",
    });
  }

  req.app.get("io").emit("receiveMessage", populated);

  res.json(populated);
};

module.exports = { getMessages, sendMessage };
