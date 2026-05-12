const express = require("express");
const router = express.Router();
const {
  getNotifications,
  createNotification,
  markNotificationRead,
  clearNotifications,
  deleteNotification,
} = require("../controllers/notificationController.js");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getNotifications);
router.post("/", protect, createNotification);
router.put("/:id/read", protect, markNotificationRead);
router.delete("/:id", protect, deleteNotification);
router.delete("/", protect, clearNotifications);

module.exports = router;
