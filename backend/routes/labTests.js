const express = require("express");
const {
  getLabTests,
  getMyLabBookings,
  getPathologyDashboard,
  createLabBooking,
  createPathologyTest,
  cancelLabBooking,
  updatePathologyBooking,
  updatePathologyTest,
} = require("../controllers/labTestController");
const { protect, pathologyOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getLabTests);
router.get("/pathology", protect, pathologyOnly, getPathologyDashboard);
router.post("/pathology/tests", protect, pathologyOnly, createPathologyTest);
router.put("/pathology/tests/:id", protect, pathologyOnly, updatePathologyTest);
router.put("/pathology/bookings/:id", protect, pathologyOnly, updatePathologyBooking);
router.get("/bookings", protect, getMyLabBookings);
router.post("/bookings", protect, createLabBooking);
router.put("/bookings/:id/cancel", protect, cancelLabBooking);

module.exports = router;
