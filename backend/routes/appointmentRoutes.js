const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const detectDoctor = require("../utils/symptomChecker");
const calculateWaitTime = require("../utils/queue");
const authMiddleware = require("../middleware/authMiddleware");

// CHECK
// CHECK (FINAL)
router.post("/check", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    if (!req.body) {
      return res.status(400).json({ error: "No body received" });
    }

    const { patientName, symptoms } = req.body;

    if (!patientName || !symptoms) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // 🔍 detect specialization
    const specialization = detectDoctor(symptoms);

    // ⏳ count existing appointments (approx queue)
    const count = await Appointment.countDocuments();

    const waitTime = calculateWaitTime(count);

    res.json({
      message: "Recommendation generated",
      specialization,
      waitTime
    });

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// BOOK
router.post("/book", authMiddleware, async (req, res) => {
  try {
    const { patientName, symptoms, doctorId, slot, appointmentDate } = req.body;

    // ✅ safety check (prevents crash)
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized ❌" });
    }

    // ✅ validation
    if (!patientName || !symptoms || !doctorId || !slot || !appointmentDate) {
      return res.status(400).json({
        message: "All fields are required ❌"
      });
    }

    // ✅ validate doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid doctorId ❌" });
    }

    // ✅ prevent double booking (IMPORTANT FIX)
    const exists = await Appointment.findOne({
      doctorId,
      slot,
      appointmentDate: new Date(appointmentDate)
    });

    if (exists) {
      return res.status(409).json({
        message: "Slot already booked ❌"
      });
    }

    // ✅ create appointment
    const appt = new Appointment({
      patientName,
      symptoms,
      doctorId,
      slot,
      appointmentDate,
      userId: req.user.id
    });

    await appt.save();

    res.status(201).json({
      message: "Appointment booked successfully ✅",
      appt
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error ❌",
      error: err.message
    });
  }
});
// MY APPOINTMENTS
router.get("/my", authMiddleware, async (req, res) => {
  const data = await Appointment.find({ userId: req.user.id })
    .populate("doctorId");

  res.json(data);
});

// DELETE
router.delete("/:id", authMiddleware, async (req, res) => {
  const appt = await Appointment.findById(req.params.id);

  if (!appt) return res.status(404).json({ error: "Not found" });

  if (appt.userId.toString() !== req.user.id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  await Appointment.findByIdAndDelete(req.params.id);

  res.json({ message: "Deleted" });
});

module.exports = router;