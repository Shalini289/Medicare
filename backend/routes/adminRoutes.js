const express = require("express");
const router = express.Router();

const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// all appointments
router.get("/appointments", authMiddleware, adminMiddleware, async (req, res) => {
  const data = await Appointment.find().populate("doctorId");
  res.json(data);
});

// add doctor
router.post("/doctor", authMiddleware, adminMiddleware, async (req, res) => {
  const doctor = new Doctor(req.body);
  await doctor.save();
  res.json({ message: "Doctor added" });
});

module.exports = router;