const express = require("express");
const {
  getLabTests,
  getMyLabBookings,
  createLabBooking,
  cancelLabBooking,
} = require("../controllers/labTestController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getLabTests);
router.get("/bookings", protect, getMyLabBookings);
router.post("/bookings", protect, createLabBooking);
router.put("/bookings/:id/cancel", protect, cancelLabBooking);

module.exports = router;
