const express = require("express");
const {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  markTaken,
} = require("../controllers/medicineReminderController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getReminders);
router.post("/", createReminder);
router.put("/:id", updateReminder);
router.put("/:id/taken", markTaken);
router.delete("/:id", deleteReminder);

module.exports = router;
