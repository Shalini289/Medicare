const Chat = require("../models/Chat");
const Notification = require("../models/Notification");

const getMessages = async (req, res) => {
  const messages = await Chat.find({
    $or: [{ sender: req.user.id }, { receiver: req.user.id }, { receiver: null }],
  })
    .populate("sender receiver", "name role")
    .sort({ createdAt: 1 });

  res.json(messages);
};

const sendMessage = async (req, res) => {
  if (!req.body.message?.trim()) {
    return res.status(400).json({ msg: "Message is required" });
  }

  const msg = await Chat.create({
    sender: req.user.id,
    receiver: req.body.receiver || null,
    message: req.body.message.trim()
  });

  const populated = await msg.populate("sender receiver", "name role");

  await Notification.create({
    user: req.body.receiver || req.user.id,
    title: "New chat message",
    message: req.body.message.trim(),
    type: "chat",
  });

  req.app.get("io").emit("receiveMessage", populated);

  res.json(populated);
};

module.exports = { getMessages, sendMessage };
