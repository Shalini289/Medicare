const MedicalRecord = require("../models/MedicalRecord");

// ✅ Upload Report
const uploadReport = async (req, res) => {
  try {
    const { patientId, doctorId, reportType, notes } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const newRecord = await MedicalRecord.create({
      patientId,
      doctorId,
      reportType,
      notes,
      reportUrl: req.file.path
    });

    res.status(201).json({
      success: true,
      data: newRecord
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Reports by Patient
const getReportsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const records = await MedicalRecord.find({ patientId })
      .populate("doctorId", "name specialization");

    res.json({
      success: true,
      data: records
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadReport,
  getReportsByPatient
};