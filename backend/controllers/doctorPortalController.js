const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const DoctorNote = require("../models/DoctorNote");
const MedicalProfile = require("../models/MedicalProfile");
const Notification = require("../models/Notification");
const Prescription = require("../models/Prescription");
const User = require("../models/User");

const diagnosisRules = [
  {
    keywords: ["fever", "cough", "cold", "throat", "runny"],
    label: "Upper respiratory infection pattern",
    plan: "Check temperature, oxygen saturation, throat findings, hydration, and red flags.",
  },
  {
    keywords: ["chest", "breath", "breathing", "palpitation"],
    label: "Cardiorespiratory concern",
    plan: "Assess vitals, ECG need, oxygen saturation, pain severity, and emergency risk.",
  },
  {
    keywords: ["sugar", "diabetes", "thirst", "urination", "fatigue"],
    label: "Diabetes or glycemic control concern",
    plan: "Review glucose logs, HbA1c, medications, diet, and hypoglycemia symptoms.",
  },
  {
    keywords: ["headache", "migraine", "nausea", "vision", "light"],
    label: "Headache or migraine pattern",
    plan: "Check neurological red flags, onset pattern, triggers, and medication overuse.",
  },
  {
    keywords: ["stomach", "abdominal", "vomit", "diarrhea", "pain"],
    label: "Gastrointestinal concern",
    plan: "Assess hydration, stool changes, abdominal exam, fever, and duration.",
  },
];

const getDoctorId = async (req) => {
  if (req.query.doctorId || req.body.doctorId) {
    return req.query.doctorId || req.body.doctorId;
  }

  const doctor = await Doctor.findOne().sort({ name: 1 });
  return doctor?._id;
};

const cleanMedicines = (medicines = []) =>
  medicines
    .map((item) => ({
      name: item.name?.trim(),
      dosage: item.dosage?.trim() || "",
      frequency: item.frequency?.trim() || "",
      duration: item.duration?.trim() || "",
      instructions: item.instructions?.trim() || "",
    }))
    .filter((item) => item.name);

const createPrescriptionCode = () => {
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `RX-${timePart}-${randomPart}`;
};

const buildDiagnosisSuggestions = (text = "") => {
  const normalized = text.toLowerCase();
  const matches = diagnosisRules.filter((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword))
  );

  const suggestions = matches.length ? matches : [{
    label: "General clinical review",
    plan: "Review symptoms, vitals, history, current medicines, allergies, and follow-up needs.",
  }];

  return {
    suggestions: suggestions.map((item) => item.label),
    carePlan: suggestions.map((item) => item.plan),
    urgency: normalized.includes("chest") || normalized.includes("breath") ? "high" : "routine",
    disclaimer: "AI suggestions are for clinical decision support and do not replace doctor judgement.",
  };
};

const buildPatientRows = async (doctorId, appointments) => {
  const patientIds = [...new Set(appointments.map((item) => item.user?._id?.toString()).filter(Boolean))];
  const [profiles, prescriptions, notes] = await Promise.all([
    MedicalProfile.find({ user: { $in: patientIds } }),
    Prescription.find({ user: { $in: patientIds } }).sort({ issuedDate: -1 }),
    DoctorNote.find({ doctor: doctorId, patient: { $in: patientIds } }).sort({ createdAt: -1 }),
  ]);

  return patientIds.map((id) => {
    const appointmentList = appointments.filter((item) => item.user?._id?.toString() === id);
    const patient = appointmentList[0]?.user;
    const profile = profiles.find((item) => item.user.toString() === id);
    const patientPrescriptions = prescriptions.filter((item) => item.user.toString() === id);
    const patientNotes = notes.filter((item) => item.patient.toString() === id);

    return {
      _id: id,
      name: patient?.name || "Patient",
      email: patient?.email || "",
      phone: patient?.phone || "",
      appointmentCount: appointmentList.length,
      lastVisit: appointmentList[0]?.date || "",
      conditions: profile?.conditions || [],
      allergies: profile?.allergies || [],
      currentMedications: profile?.currentMedications || [],
      prescriptions: patientPrescriptions.length,
      notes: patientNotes.length,
    };
  });
};

exports.getDoctorDashboard = async (req, res) => {
  const doctorId = await getDoctorId(req);

  if (!doctorId) {
    return res.status(404).json({ msg: "Doctor not found" });
  }

  const [doctor, appointments] = await Promise.all([
    Doctor.findById(doctorId),
    Appointment.find({ doctor: doctorId })
      .populate("user", "name email phone")
      .populate("doctor", "name specialization hospital availabilitySchedule availableToday")
      .sort({ date: -1, time: 1 }),
  ]);

  if (!doctor) {
    return res.status(404).json({ msg: "Doctor not found" });
  }

  const patients = await buildPatientRows(doctorId, appointments);
  const today = new Date().toISOString().slice(0, 10);

  res.json({
    doctor,
    stats: {
      appointments: appointments.length,
      todayAppointments: appointments.filter((item) => item.date === today && item.status === "booked").length,
      patients: patients.length,
      completed: appointments.filter((item) => item.status === "completed").length,
    },
    appointments,
    patients,
  });
};

exports.updateAvailability = async (req, res) => {
  const doctorId = await getDoctorId(req);
  const doctor = await Doctor.findByIdAndUpdate(
    doctorId,
    {
      availableToday: Boolean(req.body.availableToday),
      availability: req.body.availability?.trim() || "",
      availabilitySchedule: Array.isArray(req.body.availabilitySchedule) ? req.body.availabilitySchedule : [],
      slotDurationMinutes: Number(req.body.slotDurationMinutes) || 30,
    },
    { new: true, runValidators: true }
  );

  if (!doctor) {
    return res.status(404).json({ msg: "Doctor not found" });
  }

  res.json(doctor);
};

exports.scheduleAppointment = async (req, res) => {
  const doctorId = await getDoctorId(req);
  const { patientId, date, time } = req.body;

  if (!patientId || !date || !time) {
    return res.status(400).json({ msg: "Patient, date, and time are required" });
  }

  const patient = await User.findById(patientId);
  if (!patient) {
    return res.status(404).json({ msg: "Patient not found" });
  }

  try {
    const appointment = await Appointment.create({
      user: patientId,
      patient: patientId,
      doctor: doctorId,
      date,
      time,
      status: req.body.status || "booked",
    });

    await Notification.create({
      user: patientId,
      title: "Appointment scheduled",
      message: `Your appointment is scheduled for ${date} at ${time}`,
      type: "appointment",
    });

    res.status(201).json(appointment);
  } catch {
    res.status(400).json({ msg: "Slot already booked" });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  const doctorId = await getDoctorId(req);
  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, doctor: doctorId },
    { status: req.body.status },
    { new: true, runValidators: true }
  );

  if (!appointment) {
    return res.status(404).json({ msg: "Appointment not found" });
  }

  res.json(appointment);
};

exports.createDoctorNote = async (req, res) => {
  const doctorId = await getDoctorId(req);

  if (!req.body.patientId) {
    return res.status(400).json({ msg: "Patient is required" });
  }

  const note = await DoctorNote.create({
    doctor: doctorId,
    patient: req.body.patientId,
    appointment: req.body.appointmentId || undefined,
    type: req.body.type || "consultation",
    title: req.body.title?.trim() || "Clinical note",
    transcript: req.body.transcript?.trim() || "",
    summary: req.body.summary?.trim() || "",
    diagnosisSuggestions: Array.isArray(req.body.diagnosisSuggestions) ? req.body.diagnosisSuggestions : [],
    plan: req.body.plan?.trim() || "",
  });

  res.status(201).json(note);
};

exports.getDoctorNotes = async (req, res) => {
  const doctorId = await getDoctorId(req);
  const query = { doctor: doctorId };

  if (req.query.patientId) {
    query.patient = req.query.patientId;
  }

  const notes = await DoctorNote.find(query)
    .populate("patient", "name email phone")
    .sort({ createdAt: -1 });

  res.json(notes);
};

exports.createPatientPrescription = async (req, res) => {
  const doctorId = await getDoctorId(req);
  const doctor = await Doctor.findById(doctorId);
  const medicines = cleanMedicines(req.body.medicines);

  if (!req.body.patientId) {
    return res.status(400).json({ msg: "Patient is required" });
  }

  if (medicines.length === 0) {
    return res.status(400).json({ msg: "Add at least one medicine" });
  }

  const prescription = await Prescription.create({
    user: req.body.patientId,
    prescriptionCode: createPrescriptionCode(),
    doctorName: req.body.doctorName?.trim() || doctor?.name || "",
    diagnosis: req.body.diagnosis?.trim() || "",
    issuedDate: req.body.issuedDate || new Date(),
    validUntil: req.body.validUntil || undefined,
    followUpDate: req.body.followUpDate || undefined,
    medicines,
    patientInstructions: req.body.patientInstructions?.trim() || "",
    digitalSignature: req.body.digitalSignature?.trim() || doctor?.name || "Digital doctor signature",
    notes: req.body.notes?.trim() || "",
    status: "active",
  });

  await Notification.create({
    user: req.body.patientId,
    title: "New digital prescription",
    message: `${prescription.doctorName || "Doctor"} issued a prescription for ${medicines.length} medicine${medicines.length === 1 ? "" : "s"}.`,
    type: "system",
  });

  res.status(201).json(prescription);
};

exports.getDiagnosisSuggestions = async (req, res) => {
  const text = req.body.symptoms || req.body.notes || "";

  if (!text.trim()) {
    return res.status(400).json({ msg: "Clinical notes or symptoms are required" });
  }

  res.json(buildDiagnosisSuggestions(text));
};
