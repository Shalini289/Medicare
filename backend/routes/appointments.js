const express = require("express");
const router = express.Router();

const {
  bookAppointment,
  getAppointmentQueue,
  getMyAppointmentQueues,
  getMyAppointments,
  getSlots,
  cancelAppointment
} = require("../controllers/appointmentController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, bookAppointment);
router.get("/queue", protect, getAppointmentQueue);
router.get("/queue/my", protect, getMyAppointmentQueues);
router.get("/my", protect, getMyAppointments);
router.get("/slots/:doctorId/:date", getSlots);
router.put("/cancel/:id", protect, cancelAppointment);

module.exports = router;
