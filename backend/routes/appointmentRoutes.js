const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const detectDoctor = require("../utils/symptomChecker");
const calculateWaitTime = require("../utils/queue");
const authMiddleware = require("../middleware/authMiddleware");

// CHECK
router.post("/check", async (req, res) => {
  try {
    const { patientName, symptoms } = req.body;

    if (!patientName || !symptoms) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const specialization = detectDoctor(symptoms);

    const count = await Appointment.countDocuments({
      doctorId: specialization
    });

    const waitTime = calculateWaitTime(count);

    res.json({ specialization, waitTime });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BOOK
router.post("/book", authMiddleware, async (req, res) => {
  try {
    const { patientName, symptoms, doctorId, slot } = req.body;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: "Invalid doctorId" });
    }

    const exists = await Appointment.findOne({ doctorId, slot });
    if (exists) {
      return res.status(400).json({ error: "Slot already booked" });
    }

    const appt = new Appointment({
      patientName,
      symptoms,
      doctorId,
      slot,
      userId: req.user.id,
      time: new Date()
    });

    await appt.save();

    res.json({ message: "Booked", appt });

  } catch (err) {
    res.status(500).json({ error: err.message });
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