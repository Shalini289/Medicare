const AdherenceLog = require("../models/AdherenceLog");

// ✅ mark taken
const markTaken = async (req, res) => {
  const { patientId, medicineName } = req.body;
  const today = new Date().toISOString().split("T")[0];

  const log = await AdherenceLog.findOneAndUpdate(
    { patientId, medicineName, date: today },
    { status: "taken" },
    { upsert: true, new: true }
  );

  res.json({ success: true, data: log });
};

// ❌ mark missed
const markMissed = async (req, res) => {
  const { patientId, medicineName } = req.body;
  const today = new Date().toISOString().split("T")[0];

  const log = await AdherenceLog.findOneAndUpdate(
    { patientId, medicineName, date: today },
    { status: "missed" },
    { upsert: true, new: true }
  );

  res.json({ success: true, data: log });
};

// 📋 get logs
const getLogs = async (req, res) => {
  const logs = await AdherenceLog.find({
    patientId: req.params.patientId
  }).sort({ date: -1 });

  res.json({ success: true, data: logs });
};

// 🔥 streak calculation
const getStreak = async (req, res) => {
  const logs = await AdherenceLog.find({
    patientId: req.params.patientId
  }).sort({ date: -1 });

  let streak = 0;

  for (let log of logs) {
    if (log.status === "taken") streak++;
    else break;
  }

  res.json({ success: true, streak });
};

module.exports = { markTaken, markMissed, getLogs, getStreak };