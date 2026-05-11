const Chat = require("../models/Chat");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Notification = require("../models/Notification");
const User = require("../models/User");
const mongoose = require("mongoose");

const getOwnDoctor = (userId) => Doctor.findOne({ user: userId });

const serializeThreadDoctor = (doctor, lastMessage = null) => ({
  _id: doctor._id,
  type: "doctor",
  name: doctor.name,
  subtitle: doctor.specialization || doctor.hospital || "Doctor",
  doctor,
  lastMessage,
});

const serializeThreadPatient = (patient, lastMessage = null) => ({
  _id: patient._id,
  type: "patient",
  name: patient.name || "Patient",
  subtitle: patient.email || patient.phone || "Patient",
  patient,
  lastMessage,
});

const getPatientFromMessage = (message, doctorUserId) => {
  const senderId = message.sender?._id?.toString();
  const receiverId = message.receiver?._id?.toString();

  if (senderId && senderId !== doctorUserId) return message.sender;
  if (receiverId && receiverId !== doctorUserId) return message.receiver;

  return null;
};

const getThreads = async (req, res) => {
  if (req.user.role === "doctor") {
    const doctor = await getOwnDoctor(req.user.id);

    if (!doctor) {
      return res.status(404).json({ msg: "Doctor profile not found" });
    }

    const [messages, appointments] = await Promise.all([
      Chat.find({ doctor: doctor._id })
        .populate("sender receiver", "name email phone role")
        .sort({ createdAt: -1 }),
      Appointment.find({ doctor: doctor._id })
        .populate("user", "name email phone role")
        .sort({ date: -1, time: -1 }),
    ]);

    const patientMap = new Map();

    messages.forEach((message) => {
      const patient = getPatientFromMessage(message, req.user.id);
      const patientId = patient?._id?.toString();

      if (patientId && !patientMap.has(patientId)) {
        patientMap.set(patientId, serializeThreadPatient(patient, message));
      }
    });

    appointments.forEach((appointment) => {
      const patient = appointment.user;
      const patientId = patient?._id?.toString();

      if (patientId && !patientMap.has(patientId)) {
        patientMap.set(patientId, serializeThreadPatient(patient));
      }
    });

    return res.json([...patientMap.values()]);
  }

  const [doctors, messages] = await Promise.all([
    Doctor.find().sort({ specialization: 1, name: 1 }),
    Chat.find({ $or: [{ sender: req.user.id }, { receiver: req.user.id }] })
      .populate("doctor", "name specialization image hospital")
      .sort({ createdAt: -1 }),
  ]);

  const lastByDoctor = new Map();

  messages.forEach((message) => {
    const doctorId = message.doctor?._id?.toString() || message.doctor?.toString();
    if (doctorId && !lastByDoctor.has(doctorId)) {
      lastByDoctor.set(doctorId, message);
    }
  });

  res.json(doctors.map((doctor) => serializeThreadDoctor(doctor, lastByDoctor.get(doctor._id.toString()) || null)));
};

const getMessages = async (req, res) => {
  const doctorId = req.query.doctor;
  const patientId = req.query.patient;

  if (doctorId && !mongoose.isValidObjectId(doctorId)) {
    return res.status(400).json({ msg: "Invalid doctor selected" });
  }

  if (patientId && !mongoose.isValidObjectId(patientId)) {
    return res.status(400).json({ msg: "Invalid patient selected" });
  }

  let query;

  if (req.user.role === "doctor") {
    const doctor = await getOwnDoctor(req.user.id);

    if (!doctor) {
      return res.status(404).json({ msg: "Doctor profile not found" });
    }

    query = { doctor: doctor._id };

    if (patientId) {
      query.$or = [
        { sender: patientId, receiver: req.user.id },
        { sender: req.user.id, receiver: patientId },
        { sender: patientId, receiver: null },
      ];
    }
  } else {
    query = {
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    };

    if (doctorId) {
      query.doctor = doctorId;
    }
  }

  const messages = await Chat.find(query)
    .populate("sender receiver", "name email phone role")
    .populate("doctor", "name specialization image hospital")
    .sort({ createdAt: 1 });

  res.json(messages);
};

const sendMessage = async (req, res) => {
  if (!req.body.message?.trim()) {
    return res.status(400).json({ msg: "Message is required" });
  }

  let doctorId = req.body.doctor || req.body.receiverDoctor || null;
  let receiver = req.body.receiver || null;

  if (req.user.role === "doctor") {
    const doctor = await getOwnDoctor(req.user.id);

    if (!doctor) {
      return res.status(404).json({ msg: "Doctor profile not found" });
    }

    if (!receiver || !mongoose.isValidObjectId(receiver)) {
      return res.status(400).json({ msg: "Select a patient before sending a reply" });
    }

    const patient = await User.findById(receiver);

    if (!patient) {
      return res.status(404).json({ msg: "Patient not found" });
    }

    doctorId = doctor._id;
  } else {
    if (!doctorId) {
      return res.status(400).json({ msg: "Select a doctor before sending a message" });
    }

    if (!mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({ msg: "Invalid doctor selected" });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ msg: "Doctor not found" });
    }

    receiver = doctor.user || null;
  }

  const msg = await Chat.create({
    sender: req.user.id,
    receiver,
    doctor: doctorId,
    message: req.body.message.trim()
  });

  const populated = await msg.populate([
    { path: "sender receiver", select: "name role" },
    { path: "doctor", select: "name specialization image hospital" }
  ]);

  if (receiver) {
    await Notification.create({
      user: receiver,
      title: "New chat message",
      message: req.body.message.trim(),
      type: "chat",
    });
  }

  req.app.get("io").emit("receiveMessage", populated);

  res.json(populated);
};

module.exports = { getThreads, getMessages, sendMessage };
