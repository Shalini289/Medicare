const Report = require("../models/Report");
const extractText = require("../utils/extractText");
const analyzeWithAI = require("../utils/aiAnalyzer");

const uploadReport = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "Report file is required" });
  }

  const filePath = req.file.path;

  const extractedText = await extractText(filePath);
  const analysis = await analyzeWithAI(extractedText);

  const report = await Report.create({
    user: req.user.id,
    file: filePath,
    extractedText,
    analysis
  });

  res.json(report);
};

const getReports = async (req, res) => {
  const reports = await Report.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(reports);
};

module.exports = { uploadReport, getReports };
