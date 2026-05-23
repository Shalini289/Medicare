const Prescription = require("../models/Prescription");
const Notification = require("../models/Notification");
const extractText = require("../utils/extractText");
const analyzePrescriptionText = require("../utils/prescriptionAnalyzer");
const fs = require("fs/promises");

const getUserId = (req) => req.user.id || req.user._id;

const createPrescriptionCode = () => {
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `RX-${timePart}-${randomPart}`;
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

const normalizePrescription = (body) => ({
  doctorName: body.doctorName?.trim() || "",
  diagnosis: body.diagnosis?.trim() || "",
  issuedDate: body.issuedDate || new Date(),
  validUntil: body.validUntil || undefined,
  followUpDate: body.followUpDate || undefined,
  status: body.status || "active",
  medicines: cleanMedicines(body.medicines),
  patientInstructions: body.patientInstructions?.trim() || "",
  digitalSignature: body.digitalSignature?.trim() || "",
  notes: body.notes?.trim() || "",
});

exports.getPrescriptions = async (req, res) => {
  const prescriptions = await Prescription.find({ user: getUserId(req) })
    .populate("doctor", "name specialization hospital")
    .sort({ issuedDate: -1, createdAt: -1 });

  res.json(prescriptions);
};

exports.analyzePrescription = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "Prescription file is required" });
  }

  const filePath = req.file.path;
  let extractedText = "";

  try {
    extractedText = await extractText(filePath);
  } catch (err) {
    return res.status(400).json({
      msg: `Prescription text could not be read: ${err.message}`,
    });
  } finally {
    await fs.unlink(filePath).catch(() => {});
  }

  if (!extractedText?.trim()) {
    return res.status(400).json({
      msg: "No readable prescription text was found. Upload a clearer image or PDF.",
    });
  }

  const analysis = await analyzePrescriptionText(extractedText);

  res.json({
    fileName: req.file.originalname,
    extractedText,
    analysis,
  });
};

exports.handlePrescriptionUploadError = (err, req, res, next) => {
  if (!err) return next();

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ msg: "Prescription file must be 8MB or smaller" });
  }

  res.status(400).json({ msg: err.message || "Prescription upload failed" });
};

exports.createPrescription = async (req, res) => {
  const data = normalizePrescription(req.body);

  if (data.medicines.length === 0) {
    return res.status(400).json({ msg: "Add at least one medicine" });
  }

  const prescription = await Prescription.create({
    ...data,
    prescriptionCode: createPrescriptionCode(),
    digitalSignature: data.digitalSignature || data.doctorName || "MediCare Digital Prescription",
    user: getUserId(req),
  });

  await Notification.create({
    user: getUserId(req),
    title: "Prescription saved",
    message: `${data.medicines.length} medicine${data.medicines.length > 1 ? "s" : ""} added to your prescription.`,
    type: "system",
  });

  res.status(201).json(prescription);
};

exports.updatePrescription = async (req, res) => {
  const data = normalizePrescription(req.body);

  if (data.medicines.length === 0) {
    return res.status(400).json({ msg: "Add at least one medicine" });
  }

  const prescription = await Prescription.findOneAndUpdate(
    { _id: req.params.id, user: getUserId(req) },
    data,
    { new: true, runValidators: true }
  );

  if (!prescription) {
    return res.status(404).json({ msg: "Prescription not found" });
  }

  res.json(prescription);
};

exports.deletePrescription = async (req, res) => {
  const prescription = await Prescription.findOneAndDelete({
    _id: req.params.id,
    user: getUserId(req),
  });

  if (!prescription) {
    return res.status(404).json({ msg: "Prescription not found" });
  }

  res.json({ msg: "Prescription deleted" });
};
