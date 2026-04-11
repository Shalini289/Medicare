const Chat = require("../models/Chat");

const sendMessage = async (req, res) => {
  const msg = await Chat.create({
    sender: req.user.id,
    receiver: req.body.receiver,
    message: req.body.message
  });

  req.app.get("io").emit("receiveMessage", msg);

  res.json(msg);
};

module.exports = { sendMessage };