const express = require("express");
const router = express.Router();
const {
  getNotifications,
  createNotification,
  markNotificationRead,
  clearNotifications,
} = require("../controllers/notificationController.js");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getNotifications);
router.post("/", protect, createNotification);
router.put("/:id/read", protect, markNotificationRead);
router.delete("/", protect, clearNotifications);

module.exports = router;
