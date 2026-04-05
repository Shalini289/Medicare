const express = require("express");
const router = express.Router();

const MedicineReminder = require("../models/MedicineReminder");

// ✅ Create reminder
router.post("/", async (req, res) => {
  try {
    const reminder = await MedicineReminder.create(req.body);
    res.json({ success: true, data: reminder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get all reminders
router.get("/", async (req, res) => {
  try {
    const reminders = await MedicineReminder.find();
    res.json({ success: true, data: reminders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;