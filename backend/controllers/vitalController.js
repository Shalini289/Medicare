const Vital = require("../models/Vital");

const getUserId = (req) => req.user.id || req.user._id;

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeVital = (body) => ({
  recordedAt: body.recordedAt || new Date(),
  systolic: toNumber(body.systolic),
  diastolic: toNumber(body.diastolic),
  pulse: toNumber(body.pulse),
  oxygen: toNumber(body.oxygen),
  temperature: toNumber(body.temperature),
  bloodSugar: toNumber(body.bloodSugar),
  weight: toNumber(body.weight),
  notes: body.notes?.trim() || "",
});

const getStatus = (vital) => {
  const alerts = [];

  if (vital.systolic >= 140 || vital.diastolic >= 90) alerts.push("High blood pressure");
  if (vital.systolic && vital.systolic < 90) alerts.push("Low blood pressure");
  if (vital.oxygen && vital.oxygen < 94) alerts.push("Low oxygen");
  if (vital.temperature && vital.temperature >= 100.4) alerts.push("Fever");
  if (vital.pulse && (vital.pulse < 50 || vital.pulse > 120)) alerts.push("Pulse out of range");
  if (vital.bloodSugar && vital.bloodSugar > 180) alerts.push("High blood sugar");

  return alerts;
};

const buildSummary = (vitals) => {
  const latest = vitals[0] || null;
  const alerts = latest ? getStatus(latest) : [];

  return {
    count: vitals.length,
    latest,
    alerts,
    advice: alerts.length
      ? "Review these readings with a clinician if they persist or symptoms appear."
      : "Recent readings look stable. Keep tracking regularly.",
  };
};

exports.getVitals = async (req, res) => {
  const vitals = await Vital.find({ user: getUserId(req) })
    .sort({ recordedAt: -1 })
    .limit(60);

  res.json({
    records: vitals,
    summary: buildSummary(vitals),
  });
};

exports.createVital = async (req, res) => {
  const data = normalizeVital(req.body);
  const hasReading = [
    "systolic",
    "diastolic",
    "pulse",
    "oxygen",
    "temperature",
    "bloodSugar",
    "weight",
  ].some((key) => data[key] !== undefined);

  if (!hasReading) {
    return res.status(400).json({ msg: "Add at least one vital reading" });
  }

  const vital = await Vital.create({
    ...data,
    user: getUserId(req),
  });

  res.status(201).json(vital);
};

exports.updateVital = async (req, res) => {
  const vital = await Vital.findOneAndUpdate(
    { _id: req.params.id, user: getUserId(req) },
    normalizeVital(req.body),
    { new: true, runValidators: true }
  );

  if (!vital) {
    return res.status(404).json({ msg: "Vital record not found" });
  }

  res.json(vital);
};

exports.deleteVital = async (req, res) => {
  const vital = await Vital.findOneAndDelete({
    _id: req.params.id,
    user: getUserId(req),
  });

  if (!vital) {
    return res.status(404).json({ msg: "Vital record not found" });
  }

  res.json({ msg: "Vital record deleted" });
};
