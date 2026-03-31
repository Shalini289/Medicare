const Appointment = require("../models/Appointment");

exports.book = async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();

    res.json({ message: "Appointment booked" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};