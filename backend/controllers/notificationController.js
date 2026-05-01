const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  const notifications = await Notification.find({
    $or: [{ user: req.user.id }, { user: { $exists: false } }, { user: null }],
  }).sort({ createdAt: -1 });

  res.json(notifications);
};

const createNotification = async (req, res) => {
  const notification = await Notification.create({
    user: req.user.id,
    title: req.body.title || "Notification",
    message: req.body.message,
    type: req.body.type || "system",
  });

  req.app.get("io").emit("notification", notification);
  res.json(notification);
};

const markNotificationRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { read: true },
    { new: true }
  );

  res.json(notification);
};

const clearNotifications = async (req, res) => {
  await Notification.deleteMany({ user: req.user.id });
  res.json({ msg: "Notifications cleared" });
};

module.exports = {
  getNotifications,
  createNotification,
  markNotificationRead,
  clearNotifications,
};
