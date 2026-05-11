const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

const bookAppointment = async (req, res) => {
  try {
    const { doctor, date, time, patient } = req.body;

    if (!doctor || !mongoose.isValidObjectId(doctor)) {
      return res.status(400).json({ msg: "Please select a valid doctor" });
    }

    if (!date || !time) {
      return res.status(400).json({ msg: "Please choose a date and time slot" });
    }

    const doctorExists = await Doctor.exists({ _id: doctor });
    if (!doctorExists) {
      return res.status(404).json({ msg: "Doctor not found" });
    }

    const patientValue =
      patient && patient !== "self" && mongoose.isValidObjectId(patient)
        ? patient
        : req.user.id;

    const appointment = await Appointment.create({
      ...req.body,
      doctor,
      date,
      time,
      patient: patientValue,
      user: req.user.id
    });

    req.app.get("io").emit("slotBooked", appointment);

    await Notification.create({
      user: req.user.id,
      title: "Appointment booked",
      message: `Appointment confirmed for ${req.body.date} at ${req.body.time}`,
      type: "appointment",
    });

    res.json(appointment);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: "This slot is already booked" });
    }

    res.status(400).json({ msg: err.message || "Appointment could not be booked" });
  }
};

const getMyAppointments = async (req, res) => {
  const data = await Appointment.find({ user: req.user.id })
    .populate("doctor");

  res.json(data);
};

const getSlots = async (req, res) => {
  const { doctorId, date } = req.params;

  const booked = await Appointment.find({ doctor: doctorId, date, status: "booked" });

  res.json(booked.map(b => b.time));
};

const cancelAppointment = async (req, res) => {
  const appt = await Appointment.findById(req.params.id);

  if (!appt) {
    return res.status(404).json({ msg: "Appointment not found" });
  }

  if (appt.user.toString() !== req.user.id) {
    return res.status(403).json({ msg: "Not authorized" });
  }

  appt.status = "cancelled";
  await appt.save();

  await Notification.create({
    user: req.user.id,
    title: "Appointment cancelled",
    message: `Appointment on ${appt.date} at ${appt.time} was cancelled`,
    type: "appointment",
  });

  res.json({ msg: "Cancelled" });
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getSlots,
  cancelAppointment
};
