const MedicineLog = require("../models/MedicineLog");
const Notification = require("../models/Notification");

const getUserId = (req) => req.user.id || req.user._id;

const normalizeReminder = (body) => ({
  medicine: body.medicine?.trim(),
  dosage: body.dosage?.trim() || "",
  frequency: body.frequency || "daily",
  time: body.time,
  startDate: body.startDate || new Date(),
  endDate: body.endDate || undefined,
  notes: body.notes?.trim() || "",
  active: body.active !== undefined ? body.active : true,
});

exports.getReminders = async (req, res) => {
  const reminders = await MedicineLog.find({ user: getUserId(req) })
    .sort({ active: -1, time: 1, medicine: 1 });

  res.json(reminders);
};

exports.createReminder = async (req, res) => {
  const data = normalizeReminder(req.body);

  if (!data.medicine || !data.time) {
    return res.status(400).json({ msg: "Medicine name and time are required" });
  }

  const reminder = await MedicineLog.create({
    ...data,
    user: getUserId(req),
  });

  const notification = {
    user: getUserId(req),
    title: "Medicine reminder added",
    message: `${reminder.medicine} is scheduled for ${reminder.time}.`,
    type: "system",
  };

  await Notification.create(notification);
  req.app.get("io")?.emit("newNotification", notification);

  res.status(201).json(reminder);
};

exports.updateReminder = async (req, res) => {
  const reminder = await MedicineLog.findOneAndUpdate(
    { _id: req.params.id, user: getUserId(req) },
    normalizeReminder(req.body),
    { new: true, runValidators: true }
  );

  if (!reminder) {
    return res.status(404).json({ msg: "Reminder not found" });
  }

  res.json(reminder);
};

exports.deleteReminder = async (req, res) => {
  const reminder = await MedicineLog.findOneAndDelete({
    _id: req.params.id,
    user: getUserId(req),
  });

  if (!reminder) {
    return res.status(404).json({ msg: "Reminder not found" });
  }

  res.json({ msg: "Reminder deleted" });
};

exports.markTaken = async (req, res) => {
  const reminder = await MedicineLog.findOneAndUpdate(
    { _id: req.params.id, user: getUserId(req) },
    { taken: true, lastTakenAt: new Date() },
    { new: true }
  );

  if (!reminder) {
    return res.status(404).json({ msg: "Reminder not found" });
  }

  res.json(reminder);
};
