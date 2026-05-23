const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

const AVERAGE_CONSULT_MINUTES = 15;

const getToday = () => new Date().toISOString().slice(0, 10);

const toMinutes = (time = "00:00") => {
  const [hours, minutes] = String(time).split(":").map(Number);
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
};

const getNowMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const buildQueue = async ({ doctorId, date, userId = "" }) => {
  const doctor = await Doctor.findById(doctorId).select("name specialization hospital slotDurationMinutes");

  if (!doctor) {
    return null;
  }

  const appointments = await Appointment.find({ doctor: doctorId, date })
    .populate("user patient", "name email phone")
    .sort({ time: 1, createdAt: 1 });

  const activeAppointments = appointments.filter((item) => item.status !== "cancelled");
  const waitingAppointments = activeAppointments.filter((item) => item.status === "booked");
  const completedCount = activeAppointments.filter((item) => item.status === "completed").length;
  const slotMinutes = Number(doctor.slotDurationMinutes || AVERAGE_CONSULT_MINUTES);
  const nowMinutes = date === getToday() ? getNowMinutes() : 0;
  const firstWaiting = waitingAppointments[0] || null;
  const scheduledStart = firstWaiting ? toMinutes(firstWaiting.time) : 0;
  const predictedDelayMinutes = firstWaiting && date === getToday()
    ? Math.max(nowMinutes - scheduledStart, 0)
    : 0;

  const queue = activeAppointments.map((appointment, index) => {
    const activeBefore = activeAppointments
      .slice(0, index)
      .filter((item) => item.status === "booked").length;
    const waitingPosition = appointment.status === "booked" ? activeBefore + 1 : 0;
    const estimatedWaitMinutes = appointment.status === "booked"
      ? Math.max((waitingPosition - 1) * slotMinutes + predictedDelayMinutes, 0)
      : 0;

    return {
      _id: appointment._id,
      tokenNumber: index + 1,
      queuePosition: waitingPosition,
      estimatedWaitMinutes,
      status: appointment.status,
      date: appointment.date,
      time: appointment.time,
      patient: appointment.patient || appointment.user,
      user: appointment.user,
      isMine: userId
        ? appointment.user?._id?.toString() === userId || appointment.patient?._id?.toString() === userId
        : false,
    };
  });

  return {
    doctor,
    date,
    stats: {
      totalTokens: activeAppointments.length,
      waiting: waitingAppointments.length,
      completed: completedCount,
      currentToken: firstWaiting ? queue.find((item) => item._id.toString() === firstWaiting._id.toString())?.tokenNumber || null : null,
      predictedDelayMinutes,
      averageConsultMinutes: slotMinutes,
    },
    queue,
  };
};

const emitQueueUpdate = (req, appointment) => {
  req.app.get("io")?.emit("appointmentQueueUpdated", {
    doctor: appointment.doctor?.toString(),
    date: appointment.date,
  });
};

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
    emitQueueUpdate(req, appointment);

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

const getAppointmentQueue = async (req, res) => {
  const doctorId = req.query.doctor;
  const date = req.query.date || getToday();

  if (!doctorId || !mongoose.isValidObjectId(doctorId)) {
    return res.status(400).json({ msg: "Valid doctor is required" });
  }

  const queue = await buildQueue({ doctorId, date, userId: req.user.id });

  if (!queue) {
    return res.status(404).json({ msg: "Doctor not found" });
  }

  res.json(queue);
};

const getMyAppointmentQueues = async (req, res) => {
  const appointments = await Appointment.find({
    user: req.user.id,
    status: "booked",
    date: { $gte: getToday() },
  })
    .populate("doctor", "name specialization hospital slotDurationMinutes")
    .sort({ date: 1, time: 1 })
    .limit(8);

  const queues = await Promise.all(
    appointments.map((appointment) =>
      buildQueue({
        doctorId: appointment.doctor?._id || appointment.doctor,
        date: appointment.date,
        userId: req.user.id,
      })
    )
  );

  res.json(queues.filter(Boolean));
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
  emitQueueUpdate(req, appt);

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
  getAppointmentQueue,
  getMyAppointmentQueues,
  getMyAppointments,
  getSlots,
  cancelAppointment
};
