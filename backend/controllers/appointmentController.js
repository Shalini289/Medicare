const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

const AVERAGE_CONSULT_MINUTES = 15;
const APP_TIME_ZONE = process.env.APP_TIME_ZONE || "Asia/Kolkata";
const AVAILABLE_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

const getToday = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const toMinutes = (time = "00:00") => {
  const [hours, minutes] = String(time).split(":").map(Number);
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
};

const getNowMinutes = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Number(values.hour || 0) * 60 + Number(values.minute || 0);
};

const buildVideoAccessResponse = (appointment, doctor, nowMinutes) => {
  const startMinutes = toMinutes(appointment.time);
  const duration = Number(doctor.slotDurationMinutes || AVERAGE_CONSULT_MINUTES);
  const endMinutes = startMinutes + duration;

  return {
    allowed: nowMinutes >= startMinutes && nowMinutes < endMinutes,
    appointment: {
      _id: appointment._id,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
    },
    doctor: {
      _id: doctor._id,
      name: doctor.name,
      specialization: doctor.specialization,
    },
    window: {
      start: appointment.time,
      end: `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`,
      durationMinutes: duration,
    },
  };
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

    const today = getToday();

    if (date < today) {
      return res.status(400).json({ msg: "Please choose today or a future date" });
    }

    if (date === today && toMinutes(time) <= getNowMinutes()) {
      return res.status(400).json({ msg: "This time slot has already passed" });
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

const checkVideoCallAccess = async (req, res) => {
  const doctorId = req.query.doctor;

  if (!doctorId || !mongoose.isValidObjectId(doctorId)) {
    return res.status(400).json({ msg: "Valid doctor is required" });
  }

  const doctor = await Doctor.findById(doctorId).select("name specialization user slotDurationMinutes");

  if (!doctor) {
    return res.status(404).json({ msg: "Doctor not found" });
  }

  const today = getToday();
  const nowMinutes = getNowMinutes();
  const query = {
    doctor: doctorId,
    date: today,
    status: "booked",
  };

  if (req.user.role === "doctor") {
    if (String(doctor.user || "") !== String(req.user.id)) {
      return res.status(403).json({ msg: "This doctor profile is not linked to your account" });
    }
  } else {
    query.$or = [
      { user: req.user.id },
      { patient: req.user.id },
    ];
  }

  const appointments = await Appointment.find(query).sort({ time: 1 });
  const activeAppointment = appointments.find((appointment) => {
    const startMinutes = toMinutes(appointment.time);
    const endMinutes = startMinutes + Number(doctor.slotDurationMinutes || AVERAGE_CONSULT_MINUTES);
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  });

  if (activeAppointment) {
    return res.json(buildVideoAccessResponse(activeAppointment, doctor, nowMinutes));
  }

  const nextAppointment = appointments.find((appointment) => toMinutes(appointment.time) > nowMinutes) || null;
  const lastAppointment = [...appointments].reverse().find((appointment) => {
    const endMinutes = toMinutes(appointment.time) + Number(doctor.slotDurationMinutes || AVERAGE_CONSULT_MINUTES);
    return endMinutes <= nowMinutes;
  }) || null;
  const referenceAppointment = nextAppointment || lastAppointment || appointments[0] || null;

  if (!referenceAppointment) {
    return res.json({
      allowed: false,
      msg: req.user.role === "doctor"
        ? "No booked appointment is scheduled for your current slot."
        : "You can start a video call only during your booked appointment slot.",
    });
  }

  const response = buildVideoAccessResponse(referenceAppointment, doctor, nowMinutes);
  response.allowed = false;
  response.msg = nextAppointment
    ? `Video call will open at ${nextAppointment.time}.`
    : "Your booked video call slot has already ended.";

  res.json(response);
};

const getSlots = async (req, res) => {
  const { doctorId, date } = req.params;

  if (date < getToday()) {
    return res.status(400).json({ msg: "Please choose today or a future date" });
  }

  const booked = await Appointment.find({ doctor: doctorId, date, status: "booked" });
  const unavailable = booked.map((appointment) => appointment.time);

  if (date === getToday()) {
    const nowMinutes = getNowMinutes();
    unavailable.push(...AVAILABLE_SLOTS.filter((slot) => toMinutes(slot) <= nowMinutes));
  }

  res.json([...new Set(unavailable)]);
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
  checkVideoCallAccess,
  getSlots,
  cancelAppointment
};
